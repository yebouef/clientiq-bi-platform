# Architecture Decisions

## Confirmed MVP

- Project name: ClientIQ BI Platform
- Delivery target: approximately three days
- Business scenario: synthetic legal client reporting and data-quality monitoring
- Local workflow: author on Mac, execute SQL Server and build Power BI on Windows
- GitHub branch: keep the existing `master` branch during the MVP

## Core data model

The MVP uses six tables:

1. `Clients`
2. `Attorneys`
3. `Matters`
4. `TimeEntries`
5. `Invoices`
6. `DataQualityIssues`

`BudgetAmount` belongs to `Matters` for the MVP. A separate budget-history table is intentionally deferred to keep the build achievable.

## Reporting architecture

Synthetic CSV files feed SQL Server tables. A SQL stored procedure records failed validation rules in `DataQualityIssues`. Trusted reporting views and stored procedures feed the Power BI semantic model.

The source-facing tables must preserve controlled defects long enough for the quality engine to detect them. For that reason, source business identifiers used by the validation rules are not all enforced as foreign keys. `Matters` uses a SQL-generated `MatterRowID` primary key while the source `MatterID` remains available for duplicate detection. Trusted views apply the approved reporting rules after validation.

## Scope boundaries

The following items are deferred unless the core MVP is complete and verified:

- Microsoft Fabric and OneLake
- SharePoint or Smartsheet integration
- Python machine learning
- Authentication or a web application
- Cloud deployment
- Budget revision history
- Row-level security

The paginated report is optional and begins only after both Power BI dashboard pages work.
