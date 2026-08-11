# Active Task: Day 1 Data and SQL Foundation

## Objective

Create a reproducible synthetic dataset and SQL Server reporting foundation without expanding the approved MVP.

## Required build order

1. Finalize field definitions and accepted values. **Complete**
2. Generate synthetic CSV files with documented intentional defects. **Complete**
3. Create the ClientIQ database and six tables.
4. Load source data without silently correcting the intentional defects.
5. Run ten data-quality rules and populate `DataQualityIssues`.
6. Create trusted reporting views.
7. Create reporting stored procedures.
8. Test all SQL scripts on Windows SQL Server.

## Completion evidence

- CSV row counts match the approved targets.
- Every intentional error maps to a documented data-quality rule.
- SQL scripts run in folder-number order on a clean database.
- `usp_RunDataQualityChecks` produces traceable issue records.
- Reporting views exclude or clearly flag invalid records.
- Test output and screenshots are captured before Day 1 is marked complete.

## Current evidence

- Generator seed: `20260811`
- Validator result: `PASS`
- Billable-amount formula mismatches: `0`
- Invalid date formats: `0`
- Manifest rows: `268`
