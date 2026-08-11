# ClientIQ BI Platform

ClientIQ is a three-day interview portfolio project that demonstrates an end-to-end business intelligence workflow for a fictional law firm. It combines automated client reporting with a SQL-based data-quality engine so that unreliable records are identified before they reach a client-facing report.

> All project data is synthetic. No real client, legal, employee, or billing information belongs in this repository.

## Business problem

Corporate clients expect timely reporting on legal spend, matters, budgets, invoices, and attorney activity. Manual reporting is slow and creates a risk that incomplete or invalid data will be published. ClientIQ creates a repeatable workflow for validating operational data and presenting trusted results.

## MVP capabilities

- Synthetic legal operational data in CSV format
- SQL Server relational model
- Ten automated data-quality rules
- Data-quality issue log and overall quality score
- SQL reporting views and stored procedures
- Power BI client-reporting dashboard
- Power BI data-quality dashboard
- Optional paginated monthly client report after the core MVP works

## Architecture

```text
Synthetic CSV data
        |
        v
SQL Server staging and relational tables
        |
        v
SQL data-quality checks and issue log
        |
        v
Trusted reporting views and procedures
        |
        v
Power BI semantic model
        |
        +-- Client Reporting Dashboard
        +-- Data Quality Dashboard
        +-- Paginated Client Report (time permitting)
```

## Repository structure

| Folder | Purpose |
|---|---|
| `docs/` | Requirements, architecture, and data dictionary |
| `data/raw/` | Synthetic source CSV files |
| `data/sample/` | Small preview files for repository visitors |
| `sql/` | Ordered SQL Server build scripts |
| `powerbi/` | Power BI Desktop file and implementation notes |
| `paginated-report/` | Optional paginated report assets |
| `screenshots/` | Portfolio-ready images of the completed solution |

## Three-day delivery plan

### Day 1: data and SQL foundation

1. Generate the synthetic CSV files.
2. Create the SQL Server database and tables.
3. Load the synthetic data.
4. Implement ten data-quality checks.
5. Create reporting views and stored procedures.

### Day 2: Power BI dashboards

1. Load the trusted SQL reporting layer into Power BI Desktop.
2. Build the semantic model and DAX measures.
3. Build the Client Reporting dashboard.
4. Build the Data Quality dashboard.

### Day 3: polish and interview handoff

1. Add drill-through and dashboard formatting.
2. Create the paginated report if the MVP is stable.
3. Capture screenshots.
4. Complete technical documentation.
5. Prepare a five-minute interview demonstration.

## Technology

- SQL Server Developer Edition or SQL Server Express
- SQL Server Management Studio
- Power BI Desktop
- SQL, DAX, and Power Query
- Git and GitHub

The Mac is used for repository setup, documentation, synthetic data, and SQL authoring. SQL Server execution and Power BI development will be completed later on Windows.

## Current status

- [x] Repository created and cloned
- [x] MVP scope confirmed
- [x] Initial repository scaffold created
- [ ] Synthetic data generated
- [ ] SQL Server objects implemented and tested
- [ ] Power BI dashboards created
- [ ] Paginated report created
- [ ] Portfolio screenshots and demo completed
