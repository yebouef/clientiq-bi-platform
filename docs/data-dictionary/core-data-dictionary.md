# Core Data Dictionary

The final SQL types may be refined during implementation. Identifier values are human-readable synthetic keys such as `C001`, `A001`, and `M0001`.

The SQL Server implementation stores the operational tables in the `clientiq` schema. Each source-facing table also receives a SQL-generated `LoadedAtUTC datetime2(0)` audit timestamp during import.

## Clients

| Column | Proposed SQL type | Required | Description |
|---|---|---:|---|
| ClientID | `varchar(10)` | Yes | Unique client identifier |
| ClientName | `nvarchar(150)` | Yes | Synthetic corporate client name |
| Industry | `nvarchar(100)` | Yes | Client industry |
| Region | `nvarchar(50)` | Yes | Reporting region |
| ClientStatus | `varchar(20)` | Yes | `Active` or `Inactive` |
| StartDate | `date` | Yes | Date the client relationship began |

## Attorneys

| Column | Proposed SQL type | Required | Description |
|---|---|---:|---|
| AttorneyID | `varchar(10)` | Yes | Unique attorney identifier |
| AttorneyName | `nvarchar(150)` | Yes | Synthetic attorney name |
| Office | `nvarchar(100)` | Yes | Assigned office |
| PracticeArea | `nvarchar(100)` | Yes | Primary practice area |
| Title | `nvarchar(50)` | Yes | Partner, Counsel, or Associate |
| BillingRate | `decimal(10,2)` | Normally | Standard hourly rate; controlled nulls support DQ008 |
| ActiveFlag | `bit` | Yes | Whether the attorney is active |

## Matters

| Column | Proposed SQL type | Required | Description |
|---|---|---:|---|
| MatterRowID | `bigint identity` | Yes | SQL-generated physical primary key |
| MatterID | `varchar(12)` | Yes | Source business identifier; intentionally not unique so DQ002 can detect duplicates |
| ClientID | `varchar(10)` | Normally | Related client; controlled defects support DQ001 |
| MatterName | `nvarchar(200)` | Yes | Synthetic matter description |
| PracticeArea | `nvarchar(100)` | Yes | Matter practice area |
| LeadAttorneyID | `varchar(10)` | Normally | Lead attorney; controlled defects support DQ003 |
| OpenDate | `date` | Yes | Matter opening date |
| CloseDate | `date` | No | Matter closing date when closed |
| MatterStatus | `varchar(20)` | Yes | `Active`, `Closed`, or `On Hold` |
| BudgetAmount | `decimal(14,2)` | Yes | Approved matter budget |

## TimeEntries

| Column | Proposed SQL type | Required | Description |
|---|---|---:|---|
| TimeEntryID | `varchar(15)` | Yes | Unique time-entry identifier |
| MatterID | `varchar(12)` | Normally | Related matter; controlled defects support DQ007 |
| AttorneyID | `varchar(10)` | Yes | Attorney who performed the work |
| WorkDate | `date` | Yes | Date worked |
| HoursWorked | `decimal(5,2)` | Yes | Hours recorded |
| BillingRate | `decimal(10,2)` | Normally | Rate used for this entry |
| BillableAmount | `decimal(14,2)` | Yes | `HoursWorked * BillingRate` when the rate exists |
| Description | `nvarchar(250)` | Yes | Synthetic work description |

## Invoices

| Column | Proposed SQL type | Required | Description |
|---|---|---:|---|
| InvoiceID | `varchar(15)` | Yes | Unique invoice identifier |
| MatterID | `varchar(12)` | Yes | Related matter |
| InvoiceDate | `date` | Yes | Invoice issue date |
| InvoiceAmount | `decimal(14,2)` | Yes | Invoiced amount |
| InvoiceStatus | `varchar(20)` | Yes | `Draft`, `Submitted`, `Paid`, or `Overdue` |
| PaymentDate | `date` | No | Payment date for paid invoices |

## DataQualityIssues

| Column | Proposed SQL type | Required | Description |
|---|---|---:|---|
| IssueID | `bigint identity` | Yes | SQL-generated issue identifier |
| RunID | `uniqueidentifier` | Yes | Groups issues from one validation run |
| RunDate | `datetime2` | Yes | Validation execution timestamp |
| TableName | `sysname` | Yes | Table containing the affected record |
| RecordID | `varchar(50)` | Yes | Identifier of the affected record |
| RuleID | `varchar(10)` | Yes | DQ001 through DQ010 |
| RuleName | `nvarchar(150)` | Yes | Human-readable rule name |
| Severity | `varchar(20)` | Yes | `Critical`, `High`, or `Medium` |
| IssueDescription | `nvarchar(500)` | Yes | Explanation of the failed check |
| Status | `varchar(20)` | Yes | Initially `Open` |

## Constraint strategy

The source-facing SQL tables must accept the controlled defects used in the demonstration. Columns checked for missing references, orphan records, or duplicate business identifiers therefore cannot all have strict foreign-key or unique constraints during import. SQL-generated row keys, required technical identifiers, check constraints that do not block the approved test cases, and performance indexes will still be used. Trusted reporting views will expose report-ready records after validation.
