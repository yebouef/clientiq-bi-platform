import fs from "node:fs/promises";

const databasePath = "sql/01-database/01-create-clientiq-database.sql";
const tablesPath = "sql/02-tables/01-create-core-tables.sql";

const [databaseSql, tablesSql] = await Promise.all([
  fs.readFile(databasePath, "utf8"),
  fs.readFile(tablesPath, "utf8"),
]);

const csvTableMap = {
  Clients: "data/raw/clients.csv",
  Attorneys: "data/raw/attorneys.csv",
  Matters: "data/raw/matters.csv",
  TimeEntries: "data/raw/time_entries.csv",
  Invoices: "data/raw/invoices.csv",
};

const tablesSqlForChecks = tablesSql
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  .replace(/--.*$/gm, " ");

const failures = [];

function requirePattern(text, pattern, message) {
  if (!pattern.test(text)) failures.push(message);
}

requirePattern(databaseSql, /DB_ID\(N'ClientIQ'\)\s+IS\s+NULL/i, "Database script does not guard ClientIQ creation");
requirePattern(databaseSql, /CREATE\s+DATABASE\s+\[ClientIQ\]/i, "Database script does not create ClientIQ");
requirePattern(databaseSql, /CREATE\s+SCHEMA\s+\[clientiq\]/i, "Database script does not create clientiq schema");
requirePattern(databaseSql, /CREATE\s+SCHEMA\s+\[reporting\]/i, "Database script does not create reporting schema");

const requiredTables = ["Clients", "Attorneys", "Matters", "TimeEntries", "Invoices", "DataQualityIssues"];
for (const tableName of requiredTables) {
  requirePattern(
    tablesSql,
    new RegExp(`CREATE\\s+TABLE\\s+\\[clientiq\\]\\.\\[${tableName}\\]`, "i"),
    `Missing CREATE TABLE statement for ${tableName}`,
  );
}

for (const [tableName, csvPath] of Object.entries(csvTableMap)) {
  const firstLine = (await fs.readFile(csvPath, "utf8")).split(/\r?\n/, 1)[0];
  const csvColumns = firstLine.split(",");
  const tableBlockMatch = tablesSql.match(
    new RegExp(`CREATE\\s+TABLE\\s+\\[clientiq\\]\\.\\[${tableName}\\]\\s*\\(([\\s\\S]*?)\\n\\s*\\);`, "i"),
  );
  const tableBlock = tableBlockMatch?.[1] ?? "";
  for (const columnName of csvColumns) {
    requirePattern(
      tableBlock,
      new RegExp(`\\[${columnName}\\]`, "i"),
      `${tableName} is missing CSV column ${columnName}`,
    );
  }
}

const createTableCount = (tablesSql.match(/CREATE\s+TABLE\s+\[clientiq\]\.\[/gi) ?? []).length;
if (createTableCount !== 6) failures.push(`Expected 6 CREATE TABLE statements, found ${createTableCount}`);

const requiredColumns = [
  "MatterRowID",
  "MatterID",
  "ClientID",
  "LeadAttorneyID",
  "TimeEntryID",
  "HoursWorked",
  "InvoiceID",
  "InvoiceAmount",
  "IssueID",
  "RunID",
  "RuleID",
  "Severity",
];
for (const columnName of requiredColumns) {
  requirePattern(tablesSql, new RegExp(`\\[${columnName}\\]`, "i"), `Missing required column ${columnName}`);
}

if (/FOREIGN\s+KEY/i.test(tablesSqlForChecks)) {
  failures.push("Source-facing foundation must not enforce foreign keys before DQ validation");
}
if (/UNIQUE\s*(?:NONCLUSTERED\s*)?\([^)]*\[MatterID\]/i.test(tablesSql)) {
  failures.push("MatterID must remain non-unique so DQ002 records can load");
}

requirePattern(tablesSql, /SET\s+XACT_ABORT\s+ON/i, "Table script must enable XACT_ABORT");
requirePattern(tablesSql, /BEGIN\s+TRY/i, "Table script is missing TRY/CATCH handling");
requirePattern(tablesSql, /BEGIN\s+TRANSACTION/i, "Table script is missing an explicit transaction");
requirePattern(tablesSql, /ROLLBACK\s+TRANSACTION/i, "Table script is missing rollback behavior");
requirePattern(tablesSql, /THROW\s*;/i, "Table script is missing THROW behavior");
requirePattern(tablesSql, /\[ClientID\]\s+varchar\(10\)\s+NULL/i, "Matters.ClientID must allow DQ001 test records");
requirePattern(tablesSql, /\[LeadAttorneyID\]\s+varchar\(10\)\s+NULL/i, "Matters.LeadAttorneyID must allow DQ003 test records");
requirePattern(tablesSql, /\[HoursWorked\]\s+decimal\(5,2\)\s+NOT\s+NULL/i, "TimeEntries.HoursWorked definition is missing");
requirePattern(tablesSql, /\[InvoiceAmount\]\s+decimal\(14,2\)\s+NOT\s+NULL/i, "Invoices.InvoiceAmount definition is missing");

const expectedIndexes = [
  "IX_Matters_MatterID",
  "IX_Matters_ClientID_Status",
  "IX_TimeEntries_MatterID_WorkDate",
  "IX_TimeEntries_AttorneyID_WorkDate",
  "IX_Invoices_MatterID_InvoiceDate",
  "IX_DataQualityIssues_RunID_Severity",
];
for (const indexName of expectedIndexes) {
  requirePattern(tablesSql, new RegExp(`\\[${indexName}\\]`, "i"), `Missing expected index ${indexName}`);
}

const result = {
  result: failures.length === 0 ? "PASS" : "FAIL",
  files: [databasePath, tablesPath],
  createTableCount,
  expectedTableCount: 6,
  expectedIndexCount: expectedIndexes.length,
  csvColumnCompatibilityChecked: true,
  foreignKeysPresent: /FOREIGN\s+KEY/i.test(tablesSqlForChecks),
  matterIdUniqueConstraintPresent: /UNIQUE\s*(?:NONCLUSTERED\s*)?\([^)]*\[MatterID\]/i.test(tablesSql),
  runtimeExecution: "NOT RUN — requires Windows SQL Server",
  failures,
};

console.log(JSON.stringify(result, null, 2));
if (failures.length > 0) process.exitCode = 1;
