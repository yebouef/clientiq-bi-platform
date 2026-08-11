import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const rawDir = path.join(projectRoot, "data", "raw");
const sampleDir = path.join(projectRoot, "data", "sample");
const manifestPath = path.join(projectRoot, "data", "defect_manifest.csv");

const random = mulberry32(20260811);
const reportEnd = parseDate("2026-07-31");

const industries = [
  "Manufacturing",
  "Healthcare",
  "Financial Services",
  "Technology",
  "Retail",
  "Transportation",
  "Energy",
  "Hospitality",
  "Construction",
  "Professional Services",
];
const regions = ["Northeast", "Southeast", "Midwest", "Southwest", "West"];
const practiceAreas = [
  "Employment Litigation",
  "Labor Relations",
  "Immigration",
  "Compliance",
  "Workplace Safety",
  "Employee Benefits",
];
const offices = ["Atlanta", "Chicago", "Dallas", "Los Angeles", "New York", "Philadelphia"];
const titles = ["Partner", "Counsel", "Associate"];
const matterSubjects = [
  "Policy Review",
  "Employment Advisory",
  "Regulatory Response",
  "Workplace Investigation",
  "Labor Negotiation",
  "Compliance Assessment",
  "Benefits Review",
  "Immigration Support",
  "Safety Consultation",
  "Litigation Defense",
];
const workDescriptions = [
  "Reviewed case documents and prepared analysis",
  "Conducted client strategy conference",
  "Drafted correspondence and legal memorandum",
  "Prepared for witness interview",
  "Analyzed regulatory and compliance requirements",
  "Reviewed discovery materials",
  "Prepared matter status update",
  "Performed legal research",
  "Coordinated matter planning with client team",
  "Reviewed billing and budget status",
];

const clientNames = [
  "Apex Manufacturing Group",
  "Blue Harbor Health Systems",
  "Cedar Ridge Financial",
  "DeltaWorks Technology",
  "Evergreen Retail Partners",
  "Frontier Transit Holdings",
  "Granite Peak Energy",
  "Harborlight Hospitality",
  "Ironwood Construction",
  "Juniper Professional Services",
  "Keystone Medical Devices",
  "Lakeside Consumer Products",
  "Meridian Logistics Group",
  "Northstar Digital Solutions",
  "Oak Valley Foods",
  "Pioneer Aerospace Components",
  "Quartz Ridge Utilities",
  "Redwood Community Banking",
  "Summit Home Products",
  "TerracePoint Communications",
];

const firstNames = [
  "Jordan", "Taylor", "Morgan", "Avery", "Casey", "Riley", "Cameron", "Parker",
  "Quinn", "Reese", "Skyler", "Drew", "Emerson", "Hayden", "Kendall", "Rowan",
  "Alex", "Blair", "Devin", "Finley",
];
const lastNames = [
  "Adams", "Brooks", "Carter", "Diaz", "Ellis", "Foster", "Grant", "Hayes",
  "Irwin", "Jordan", "Kim", "Lee", "Morgan", "Nguyen", "Owens", "Patel",
  "Reed", "Shaw", "Turner", "Walker",
];

const defectManifest = [];
let defectSequence = 1;

function mulberry32(seed) {
  return function next() {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function integer(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function choose(values) {
  return values[integer(0, values.length - 1)];
}

function pad(value, length) {
  return String(value).padStart(length, "0");
}

function parseDate(value) {
  return new Date(`${value}T00:00:00Z`);
}

function formatDate(value) {
  return value.toISOString().slice(0, 10);
}

function addDays(value, days) {
  const result = new Date(value);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function randomDate(start, end) {
  const startTime = start.getTime();
  const endTime = end.getTime();
  return new Date(startTime + Math.floor(random() * (endTime - startTime + 86400000)));
}

function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

function csvValue(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows, columns) {
  const lines = [columns.join(",")];
  for (const row of rows) {
    lines.push(columns.map((column) => csvValue(row[column])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function recordDefect({ ruleId, tableName, sourceRowNumber, recordId, fieldName, originalValue, injectedValue, severity, description }) {
  defectManifest.push({
    DefectID: `DEF${pad(defectSequence++, 4)}`,
    RuleID: ruleId,
    TableName: tableName,
    SourceRowNumber: sourceRowNumber,
    RecordID: recordId,
    FieldName: fieldName,
    OriginalValue: originalValue,
    InjectedValue: injectedValue,
    ExpectedSeverity: severity,
    ExpectedIssueDescription: description,
  });
}

const clients = clientNames.map((clientName, index) => ({
  ClientID: `C${pad(index + 1, 3)}`,
  ClientName: clientName,
  Industry: industries[index % industries.length],
  Region: regions[index % regions.length],
  ClientStatus: index < 17 ? "Active" : "Inactive",
  StartDate: formatDate(randomDate(parseDate("2015-01-01"), parseDate("2023-12-31"))),
}));

const attorneys = Array.from({ length: 40 }, (_, index) => {
  const title = titles[index % titles.length];
  const baseRate = title === "Partner" ? 650 : title === "Counsel" ? 525 : 375;
  return {
    AttorneyID: `A${pad(index + 1, 3)}`,
    AttorneyName: `${firstNames[index % firstNames.length]} ${lastNames[(index * 7) % lastNames.length]}`,
    Office: offices[index % offices.length],
    PracticeArea: practiceAreas[index % practiceAreas.length],
    Title: title,
    BillingRate: baseRate + (index % 5) * 25,
    ActiveFlag: index < 37 ? 1 : 0,
  };
});

const matters = Array.from({ length: 150 }, (_, index) => {
  const openDate = randomDate(parseDate("2023-01-01"), parseDate("2025-12-31"));
  const statusRoll = index % 10;
  const matterStatus = statusRoll < 6 ? "Active" : statusRoll < 9 ? "Closed" : "On Hold";
  let closeDate = null;
  if (matterStatus === "Closed") {
    closeDate = addDays(openDate, integer(90, 420));
    if (closeDate > reportEnd) closeDate = reportEnd;
  }
  return {
    MatterID: `M${pad(index + 1, 4)}`,
    ClientID: clients[index % clients.length].ClientID,
    MatterName: `${choose(matterSubjects)} ${pad(index + 1, 3)}`,
    PracticeArea: practiceAreas[index % practiceAreas.length],
    LeadAttorneyID: attorneys[(index * 3) % 37].AttorneyID,
    OpenDate: formatDate(openDate),
    CloseDate: closeDate ? formatDate(closeDate) : null,
    MatterStatus: matterStatus,
    BudgetAmount: integer(5, 50) * 10000,
  };
});

// DQ002: Four duplicate matter identifiers, affecting eight source rows.
for (let pair = 0; pair < 4; pair += 1) {
  const originalIndex = pair * 2;
  const changedIndex = originalIndex + 1;
  const duplicatedId = matters[originalIndex].MatterID;
  const changedOriginalId = matters[changedIndex].MatterID;
  matters[changedIndex].MatterID = duplicatedId;
  matters[changedIndex].ClientID = matters[originalIndex].ClientID;
  matters[changedIndex].LeadAttorneyID = matters[originalIndex].LeadAttorneyID;
  matters[changedIndex].OpenDate = matters[originalIndex].OpenDate;
  matters[changedIndex].CloseDate = matters[originalIndex].CloseDate;
  matters[changedIndex].MatterStatus = matters[originalIndex].MatterStatus;
  recordDefect({
    ruleId: "DQ002",
    tableName: "Matters",
    sourceRowNumber: originalIndex + 2,
    recordId: `${duplicatedId}@row${originalIndex + 2}`,
    fieldName: "MatterID",
    originalValue: duplicatedId,
    injectedValue: duplicatedId,
    severity: "Critical",
    description: `MatterID ${duplicatedId} now appears in more than one source row.`,
  });
  recordDefect({
    ruleId: "DQ002",
    tableName: "Matters",
    sourceRowNumber: changedIndex + 2,
    recordId: `${duplicatedId}@row${changedIndex + 2}`,
    fieldName: "MatterID",
    originalValue: changedOriginalId,
    injectedValue: duplicatedId,
    severity: "Critical",
    description: `MatterID ${changedOriginalId} was changed to duplicate ${duplicatedId}.`,
  });
}

// DQ001: Five matters with missing or invalid client references.
for (let index = 8; index <= 12; index += 1) {
  const original = matters[index].ClientID;
  const injected = index < 11 ? "C999" : null;
  matters[index].ClientID = injected;
  recordDefect({
    ruleId: "DQ001",
    tableName: "Matters",
    sourceRowNumber: index + 2,
    recordId: `${matters[index].MatterID}@row${index + 2}`,
    fieldName: "ClientID",
    originalValue: original,
    injectedValue: injected,
    severity: "Critical",
    description: "Matter does not reference an existing client.",
  });
}

// DQ003: Five active matters with no lead attorney.
for (let index = 13; index <= 17; index += 1) {
  const original = matters[index].LeadAttorneyID;
  matters[index].MatterStatus = "Active";
  matters[index].CloseDate = null;
  matters[index].LeadAttorneyID = null;
  recordDefect({
    ruleId: "DQ003",
    tableName: "Matters",
    sourceRowNumber: index + 2,
    recordId: `${matters[index].MatterID}@row${index + 2}`,
    fieldName: "LeadAttorneyID",
    originalValue: original,
    injectedValue: null,
    severity: "High",
    description: "Active matter has no valid lead attorney.",
  });
}

// DQ004: Four matters with a close date before the open date.
for (let index = 18; index <= 21; index += 1) {
  const original = matters[index].CloseDate;
  matters[index].MatterStatus = "Closed";
  matters[index].CloseDate = formatDate(addDays(parseDate(matters[index].OpenDate), -integer(10, 60)));
  recordDefect({
    ruleId: "DQ004",
    tableName: "Matters",
    sourceRowNumber: index + 2,
    recordId: `${matters[index].MatterID}@row${index + 2}`,
    fieldName: "CloseDate",
    originalValue: original,
    injectedValue: matters[index].CloseDate,
    severity: "High",
    description: "Matter close date is earlier than its open date.",
  });
}

const dailyHours = new Map();
const timeEntries = [];
for (let index = 0; index < 8000; index += 1) {
  let matter;
  let attorney;
  let workDate;
  let hoursWorked;
  let attempts = 0;
  do {
    matter = choose(matters);
    attorney = choose(attorneys.slice(0, 37));
    const start = parseDate(matter.OpenDate);
    const end = matter.CloseDate && parseDate(matter.CloseDate) >= start ? parseDate(matter.CloseDate) : reportEnd;
    workDate = randomDate(start, end);
    hoursWorked = integer(1, 16) / 2;
    attempts += 1;
  } while ((dailyHours.get(`${attorney.AttorneyID}|${formatDate(workDate)}`) ?? 0) + hoursWorked > 12 && attempts < 100);

  const key = `${attorney.AttorneyID}|${formatDate(workDate)}`;
  dailyHours.set(key, (dailyHours.get(key) ?? 0) + hoursWorked);
  timeEntries.push({
    TimeEntryID: `TE${pad(index + 1, 5)}`,
    MatterID: matter.MatterID,
    AttorneyID: attorney.AttorneyID,
    WorkDate: formatDate(workDate),
    HoursWorked: hoursWorked,
    BillingRate: attorney.BillingRate,
    BillableAmount: roundCurrency(hoursWorked * attorney.BillingRate),
    Description: choose(workDescriptions),
  });
}

// DQ005: Forty time entries with invalid hours.
const invalidHours = [0, -1, 25, 30];
for (let index = 0; index < 40; index += 1) {
  const entry = timeEntries[index];
  const original = entry.HoursWorked;
  entry.HoursWorked = invalidHours[index % invalidHours.length];
  entry.BillableAmount = roundCurrency(entry.HoursWorked * entry.BillingRate);
  recordDefect({
    ruleId: "DQ005",
    tableName: "TimeEntries",
    sourceRowNumber: index + 2,
    recordId: entry.TimeEntryID,
    fieldName: "HoursWorked",
    originalValue: original,
    injectedValue: entry.HoursWorked,
    severity: "High",
    description: "Time entry hours are less than or equal to 0 or greater than 24.",
  });
}

// DQ007: Fifty time entries referencing nonexistent matters.
for (let index = 40; index < 90; index += 1) {
  const entry = timeEntries[index];
  const original = entry.MatterID;
  entry.MatterID = `MX${pad(index - 39, 4)}`;
  recordDefect({
    ruleId: "DQ007",
    tableName: "TimeEntries",
    sourceRowNumber: index + 2,
    recordId: entry.TimeEntryID,
    fieldName: "MatterID",
    originalValue: original,
    injectedValue: entry.MatterID,
    severity: "Critical",
    description: "Time entry references a MatterID that does not exist.",
  });
}

// DQ008: Twenty time entries with no billing rate.
for (let index = 90; index < 110; index += 1) {
  const entry = timeEntries[index];
  const original = entry.BillingRate;
  entry.BillingRate = null;
  entry.BillableAmount = null;
  recordDefect({
    ruleId: "DQ008",
    tableName: "TimeEntries",
    sourceRowNumber: index + 2,
    recordId: entry.TimeEntryID,
    fieldName: "BillingRate",
    originalValue: original,
    injectedValue: null,
    severity: "Medium",
    description: "Time entry has no billing rate.",
  });
}

// DQ010: Thirty attorney-date groups with three six-hour entries each.
const safeActiveMatters = matters.filter((matter, index) => index > 21 && matter.MatterStatus === "Active");
for (let group = 0; group < 30; group += 1) {
  const attorney = attorneys[6 + (group % 10)];
  const workDate = formatDate(addDays(parseDate("2026-08-01"), Math.floor(group / 10)));
  const matter = safeActiveMatters[group % safeActiveMatters.length];
  for (let member = 0; member < 3; member += 1) {
    const index = 110 + group * 3 + member;
    const entry = timeEntries[index];
    const original = `${entry.AttorneyID}|${entry.WorkDate}|${entry.HoursWorked}`;
    entry.MatterID = matter.MatterID;
    entry.AttorneyID = attorney.AttorneyID;
    entry.WorkDate = workDate;
    entry.HoursWorked = 6;
    entry.BillingRate = attorney.BillingRate;
    entry.BillableAmount = roundCurrency(entry.HoursWorked * entry.BillingRate);
    recordDefect({
      ruleId: "DQ010",
      tableName: "TimeEntries",
      sourceRowNumber: index + 2,
      recordId: entry.TimeEntryID,
      fieldName: "AttorneyID|WorkDate|HoursWorked",
      originalValue: original,
      injectedValue: `${entry.AttorneyID}|${entry.WorkDate}|${entry.HoursWorked}`,
      severity: "Medium",
      description: `Attorney ${entry.AttorneyID} has more than 16 total hours on ${entry.WorkDate}.`,
    });
  }
}

const invoices = Array.from({ length: 750 }, (_, index) => {
  const matter = choose(matters);
  const openDate = parseDate(matter.OpenDate);
  const validCloseDate = matter.CloseDate && parseDate(matter.CloseDate) >= openDate ? parseDate(matter.CloseDate) : reportEnd;
  const invoiceDate = randomDate(openDate, validCloseDate);
  const status = choose(["Draft", "Submitted", "Paid", "Overdue"]);
  let paymentDate = null;
  if (status === "Paid") {
    const candidate = addDays(invoiceDate, integer(7, 75));
    paymentDate = formatDate(candidate > reportEnd ? reportEnd : candidate);
  }
  return {
    InvoiceID: `INV${pad(index + 1, 4)}`,
    MatterID: matter.MatterID,
    InvoiceDate: formatDate(invoiceDate),
    InvoiceAmount: roundCurrency(integer(10, 750) * 100 + integer(0, 99) / 100),
    InvoiceStatus: status,
    PaymentDate: paymentDate,
  };
});

// DQ006: Fifteen negative invoices.
for (let index = 0; index < 15; index += 1) {
  const invoice = invoices[index];
  const original = invoice.InvoiceAmount;
  invoice.InvoiceAmount = -Math.abs(invoice.InvoiceAmount);
  recordDefect({
    ruleId: "DQ006",
    tableName: "Invoices",
    sourceRowNumber: index + 2,
    recordId: invoice.InvoiceID,
    fieldName: "InvoiceAmount",
    originalValue: original,
    injectedValue: invoice.InvoiceAmount,
    severity: "Critical",
    description: "Invoice amount is below zero.",
  });
}

// DQ009: Twenty-five invoices dated before their matter opened.
for (let index = 15; index < 40; index += 1) {
  const invoice = invoices[index];
  const matter = matters.find((candidate) => candidate.MatterID === invoice.MatterID);
  const original = invoice.InvoiceDate;
  invoice.InvoiceDate = formatDate(addDays(parseDate(matter.OpenDate), -integer(5, 60)));
  invoice.PaymentDate = null;
  if (invoice.InvoiceStatus === "Paid") invoice.InvoiceStatus = "Submitted";
  recordDefect({
    ruleId: "DQ009",
    tableName: "Invoices",
    sourceRowNumber: index + 2,
    recordId: invoice.InvoiceID,
    fieldName: "InvoiceDate",
    originalValue: original,
    injectedValue: invoice.InvoiceDate,
    severity: "High",
    description: "Invoice date is earlier than the related matter open date.",
  });
}

// DQ008: Six attorneys with missing standard rates. Time-entry rates remain historical values.
for (let index = 0; index < 6; index += 1) {
  const attorney = attorneys[index];
  const original = attorney.BillingRate;
  attorney.BillingRate = null;
  recordDefect({
    ruleId: "DQ008",
    tableName: "Attorneys",
    sourceRowNumber: index + 2,
    recordId: attorney.AttorneyID,
    fieldName: "BillingRate",
    originalValue: original,
    injectedValue: null,
    severity: "Medium",
    description: "Attorney has no standard billing rate.",
  });
}

const definitions = [
  { fileName: "clients.csv", rows: clients, columns: ["ClientID", "ClientName", "Industry", "Region", "ClientStatus", "StartDate"] },
  { fileName: "attorneys.csv", rows: attorneys, columns: ["AttorneyID", "AttorneyName", "Office", "PracticeArea", "Title", "BillingRate", "ActiveFlag"] },
  { fileName: "matters.csv", rows: matters, columns: ["MatterID", "ClientID", "MatterName", "PracticeArea", "LeadAttorneyID", "OpenDate", "CloseDate", "MatterStatus", "BudgetAmount"] },
  { fileName: "time_entries.csv", rows: timeEntries, columns: ["TimeEntryID", "MatterID", "AttorneyID", "WorkDate", "HoursWorked", "BillingRate", "BillableAmount", "Description"] },
  { fileName: "invoices.csv", rows: invoices, columns: ["InvoiceID", "MatterID", "InvoiceDate", "InvoiceAmount", "InvoiceStatus", "PaymentDate"] },
];

const manifestColumns = [
  "DefectID",
  "RuleID",
  "TableName",
  "SourceRowNumber",
  "RecordID",
  "FieldName",
  "OriginalValue",
  "InjectedValue",
  "ExpectedSeverity",
  "ExpectedIssueDescription",
];

await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(sampleDir, { recursive: true });

for (const definition of definitions) {
  await fs.writeFile(path.join(rawDir, definition.fileName), toCsv(definition.rows, definition.columns), "utf8");
  await fs.writeFile(path.join(sampleDir, definition.fileName), toCsv(definition.rows.slice(0, 10), definition.columns), "utf8");
}
await fs.writeFile(manifestPath, toCsv(defectManifest, manifestColumns), "utf8");

const countsByRule = Object.fromEntries(
  Array.from({ length: 10 }, (_, index) => `DQ${pad(index + 1, 3)}`).map((ruleId) => [
    ruleId,
    defectManifest.filter((row) => row.RuleID === ruleId).length,
  ]),
);

const sourceRowCount = clients.length + attorneys.length + matters.length + timeEntries.length + invoices.length;
const distinctAffectedRecords = new Set(defectManifest.map((row) => `${row.TableName}|${row.SourceRowNumber}`)).size;
const report = {
  seed: 20260811,
  generatedThrough: "2026-08-03",
  rowCounts: Object.fromEntries(definitions.map((definition) => [definition.fileName, definition.rows.length])),
  defectManifestRows: defectManifest.length,
  distinctAffectedRecords,
  sourceRowCount,
  affectedRecordRate: distinctAffectedRecords / sourceRowCount,
  expectedQualityScore: 1 - distinctAffectedRecords / sourceRowCount,
  countsByRule,
};

await fs.mkdir(path.join(projectRoot, "work"), { recursive: true });
await fs.writeFile(path.join(projectRoot, "work", "synthetic_data_report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(JSON.stringify(report, null, 2));
