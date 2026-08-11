import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const rawDir = path.join(projectRoot, "data", "raw");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(value);
      value = "";
    } else if (character === "\n") {
      row.push(value.replace(/\r$/, ""));
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }
  if (value || row.length) {
    row.push(value.replace(/\r$/, ""));
    rows.push(row);
  }
  const [headers, ...data] = rows;
  return data.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
}

async function loadCsv(relativePath) {
  return parseCsv(await fs.readFile(path.join(projectRoot, relativePath), "utf8"));
}

function countDuplicates(rows, field) {
  const counts = new Map();
  for (const row of rows) counts.set(row[field], (counts.get(row[field]) ?? 0) + 1);
  return rows.filter((row) => (counts.get(row[field]) ?? 0) > 1).length;
}

function assert(condition, message, failures) {
  if (!condition) failures.push(message);
}

const [clients, attorneys, matters, timeEntries, invoices, manifest] = await Promise.all([
  loadCsv("data/raw/clients.csv"),
  loadCsv("data/raw/attorneys.csv"),
  loadCsv("data/raw/matters.csv"),
  loadCsv("data/raw/time_entries.csv"),
  loadCsv("data/raw/invoices.csv"),
  loadCsv("data/defect_manifest.csv"),
]);

const failures = [];
const expectedRows = {
  Clients: 20,
  Attorneys: 40,
  Matters: 150,
  TimeEntries: 8000,
  Invoices: 750,
  DefectManifest: 268,
};
const actualRows = {
  Clients: clients.length,
  Attorneys: attorneys.length,
  Matters: matters.length,
  TimeEntries: timeEntries.length,
  Invoices: invoices.length,
  DefectManifest: manifest.length,
};
for (const [name, expected] of Object.entries(expectedRows)) {
  assert(actualRows[name] === expected, `${name}: expected ${expected} rows, found ${actualRows[name]}`, failures);
}

assert(new Set(clients.map((row) => row.ClientID)).size === clients.length, "ClientID values are not unique", failures);
assert(new Set(attorneys.map((row) => row.AttorneyID)).size === attorneys.length, "AttorneyID values are not unique", failures);
assert(new Set(timeEntries.map((row) => row.TimeEntryID)).size === timeEntries.length, "TimeEntryID values are not unique", failures);
assert(new Set(invoices.map((row) => row.InvoiceID)).size === invoices.length, "InvoiceID values are not unique", failures);
assert(countDuplicates(matters, "MatterID") === 8, "Expected exactly eight matter rows affected by duplicate identifiers", failures);

const clientIds = new Set(clients.map((row) => row.ClientID));
const attorneyIds = new Set(attorneys.map((row) => row.AttorneyID));
const matterIds = new Set(matters.map((row) => row.MatterID));
const matterOpenDates = new Map();
for (const matter of matters) {
  const current = matterOpenDates.get(matter.MatterID);
  if (!current || matter.OpenDate < current) matterOpenDates.set(matter.MatterID, matter.OpenDate);
}

const validIndividualEntries = timeEntries.filter((row) => Number(row.HoursWorked) > 0 && Number(row.HoursWorked) <= 24);
const dailyTotals = new Map();
for (const row of validIndividualEntries) {
  const key = `${row.AttorneyID}|${row.WorkDate}`;
  dailyTotals.set(key, (dailyTotals.get(key) ?? 0) + Number(row.HoursWorked));
}

const dqCounts = {
  DQ001: matters.filter((row) => !row.ClientID || !clientIds.has(row.ClientID)).length,
  DQ002: countDuplicates(matters, "MatterID"),
  DQ003: matters.filter((row) => row.MatterStatus === "Active" && (!row.LeadAttorneyID || !attorneyIds.has(row.LeadAttorneyID))).length,
  DQ004: matters.filter((row) => row.CloseDate && row.CloseDate < row.OpenDate).length,
  DQ005: timeEntries.filter((row) => Number(row.HoursWorked) <= 0 || Number(row.HoursWorked) > 24).length,
  DQ006: invoices.filter((row) => Number(row.InvoiceAmount) < 0).length,
  DQ007: timeEntries.filter((row) => !matterIds.has(row.MatterID)).length,
  DQ008: attorneys.filter((row) => row.BillingRate === "").length + timeEntries.filter((row) => row.BillingRate === "").length,
  DQ009: invoices.filter((row) => row.InvoiceDate < matterOpenDates.get(row.MatterID)).length,
  DQ010: validIndividualEntries.filter((row) => (dailyTotals.get(`${row.AttorneyID}|${row.WorkDate}`) ?? 0) > 16).length,
};

const expectedDqCounts = {
  DQ001: 5,
  DQ002: 8,
  DQ003: 5,
  DQ004: 4,
  DQ005: 40,
  DQ006: 15,
  DQ007: 50,
  DQ008: 26,
  DQ009: 25,
  DQ010: 90,
};
for (const [ruleId, expected] of Object.entries(expectedDqCounts)) {
  assert(dqCounts[ruleId] === expected, `${ruleId}: expected ${expected} affected rows, found ${dqCounts[ruleId]}`, failures);
  const manifestCount = manifest.filter((row) => row.RuleID === ruleId).length;
  assert(manifestCount === expected, `${ruleId}: manifest expected ${expected} rows, found ${manifestCount}`, failures);
}

let formulaMismatchCount = 0;
for (const row of timeEntries) {
  if (row.BillingRate === "" || row.BillableAmount === "") continue;
  const expected = Math.round(Number(row.HoursWorked) * Number(row.BillingRate) * 100) / 100;
  if (Math.abs(Number(row.BillableAmount) - expected) > 0.001) formulaMismatchCount += 1;
}
assert(formulaMismatchCount === 0, `Found ${formulaMismatchCount} BillableAmount formula mismatches`, failures);

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const invalidDateFormatCount = [
  ...clients.map((row) => row.StartDate),
  ...matters.flatMap((row) => [row.OpenDate, row.CloseDate]).filter(Boolean),
  ...timeEntries.map((row) => row.WorkDate),
  ...invoices.flatMap((row) => [row.InvoiceDate, row.PaymentDate]).filter(Boolean),
].filter((value) => !datePattern.test(value)).length;
assert(invalidDateFormatCount === 0, `Found ${invalidDateFormatCount} dates outside YYYY-MM-DD format`, failures);

const sourceRowCount = clients.length + attorneys.length + matters.length + timeEntries.length + invoices.length;
const distinctAffectedRecords = new Set(manifest.map((row) => `${row.TableName}|${row.SourceRowNumber}`)).size;
const summary = {
  result: failures.length === 0 ? "PASS" : "FAIL",
  rowCounts: actualRows,
  dqCounts,
  sourceRowCount,
  distinctAffectedRecords,
  affectedRecordRate: distinctAffectedRecords / sourceRowCount,
  expectedQualityScore: 1 - distinctAffectedRecords / sourceRowCount,
  billableAmountFormulaMismatches: formulaMismatchCount,
  invalidDateFormats: invalidDateFormatCount,
  failures,
};

await fs.mkdir(path.join(projectRoot, "work"), { recursive: true });
await fs.writeFile(path.join(projectRoot, "work", "synthetic_data_validation.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
console.log(JSON.stringify(summary, null, 2));
if (failures.length > 0) process.exitCode = 1;
