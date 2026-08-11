# ClientIQ MVP Requirements

## 1. Objective

Demonstrate the full BI lifecycle for an interview: business requirements, relational data modeling, SQL development, automated data-quality checks, trusted reporting datasets, Power BI dashboards, and client-ready communication.

## 2. Users

### Internal BI analyst

- Runs data-quality checks.
- Reviews critical, high, and medium issues.
- Determines whether data is ready for reporting.

### Law-firm leadership

- Reviews legal spend, matter activity, budget consumption, and attorney workload.

### Corporate client

- Reviews its own matters, hours, invoices, spend trends, and budget performance.

## 3. Approved data scope

| Table | Target rows | Purpose |
|---|---:|---|
| Clients | 20 | Corporate client master data |
| Attorneys | 40 | Attorney profile and billing-rate data |
| Matters | 150 | Legal matters and matter budgets |
| TimeEntries | 8,000 | Daily billable activity |
| Invoices | 750 | Matter invoice and payment data |
| DataQualityIssues | Generated | Results from validation runs |

Approximately 3% to 5% of relevant source records will contain controlled defects for demonstration purposes.

## 4. Client Reporting dashboard requirements

### KPI cards

- Total legal spend
- Active matters
- Billable hours
- Budget utilization percentage
- Average hourly rate

### Visuals

- Spend by month
- Spend by practice area
- Budget versus actual by matter
- Top matters by spend
- Matters by status
- Attorney hours

### Filters

- Client
- Date
- Practice area
- Matter status

## 5. Data Quality dashboard requirements

### KPI cards

- Overall quality score
- Total issues
- Critical issues
- High-severity issues
- Affected records
- Open issues

### Visuals

- Issues by rule
- Issues by severity
- Issues by table
- Quality trend by validation run
- Detailed issue table

## 6. Data-quality rules

| Rule | Name | Severity | Condition |
|---|---|---|---|
| DQ001 | Missing or invalid client | Critical | A matter does not reference an existing client |
| DQ002 | Duplicate matter identifier | Critical | A source matter identifier appears more than once |
| DQ003 | Missing lead attorney | High | An active matter has no valid lead attorney |
| DQ004 | Invalid matter dates | High | `CloseDate` is earlier than `OpenDate` |
| DQ005 | Invalid time entry hours | High | `HoursWorked` is less than or equal to 0 or greater than 24 |
| DQ006 | Negative invoice amount | Critical | `InvoiceAmount` is less than 0 |
| DQ007 | Orphan time entry | Critical | A time entry does not reference an existing matter |
| DQ008 | Missing billing rate | Medium | An attorney or time entry has no billing rate |
| DQ009 | Invoice before matter opened | High | `InvoiceDate` is earlier than the matter's `OpenDate` |
| DQ010 | Potential billing anomaly | Medium | One attorney records more than 16 total hours on one date |

## 7. SQL deliverables

### Stored procedures

- `usp_RunDataQualityChecks`
- `usp_GetClientMonthlyReport`
- `usp_GetMatterPerformance`
- `usp_GetDataQualitySummary`

### Views

- `vw_ClientMatterPerformance`
- `vw_MonthlyLegalSpend`
- `vw_BudgetPerformance`
- `vw_DataQualitySummary`

## 8. Acceptance criteria

The MVP is complete when:

1. All SQL scripts run successfully on a clean SQL Server database.
2. Synthetic data loads with the expected row counts.
3. Each of the ten validation rules detects at least one controlled defect.
4. Both Power BI dashboard pages display the required KPIs and visuals.
5. Client, date, and practice-area filters work as designed.
6. The repository contains setup instructions, architecture documentation, the data dictionary, and portfolio screenshots.

