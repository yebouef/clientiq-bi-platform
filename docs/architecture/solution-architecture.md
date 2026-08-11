# Solution Architecture

## Data flow

```text
data/raw/*.csv
       |
       v
SQL Server core tables
       |
       +--> usp_RunDataQualityChecks
       |           |
       |           v
       |    DataQualityIssues
       |
       v
Trusted reporting views and stored procedures
       |
       v
Power BI semantic model
       |
       +--> Client Reporting page
       +--> Data Quality page
       +--> Paginated report, if time permits
```

## Design principles

- Source data remains reproducible and unchanged after generation.
- Source-facing tables preserve controlled defects instead of rejecting or silently correcting them during import.
- Validation results are traceable by rule, record, severity, and run date.
- Reporting logic lives in documented SQL views and procedures rather than being hidden entirely inside Power BI.
- The Power BI model uses clear relationships and explicit DAX measures.
- Optional technology is deferred until the core reporting flow is verified.

## Core relationships

```text
Clients    1 ---- many Matters
Attorneys  1 ---- many Matters         (lead attorney)
Matters    1 ---- many TimeEntries
Attorneys  1 ---- many TimeEntries
Matters    1 ---- many Invoices
```

`DataQualityIssues` stores validation results using `TableName` and `RecordID` so one issue structure can describe defects from multiple source tables.

The diagram describes logical reporting relationships. Foreign keys are not enforced on source identifiers that must support intentional orphan, missing-reference, or duplicate tests. `Matters.MatterRowID` is the physical primary key; `Matters.MatterID` is the business identifier checked by DQ002.

## Platform boundary

Files can be authored on macOS, but SQL Server behavior and Power BI assets are not considered verified until they run on the Windows computer.
