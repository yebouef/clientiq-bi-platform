# Project Scripts

## Generate the synthetic dataset

From the repository root, run:

```bash
node scripts/generate_synthetic_data.mjs
```

The generator uses a fixed seed (`20260811`), so every run produces the same records and controlled defects. It creates five complete CSV files in `data/raw`, five ten-row preview files in `data/sample`, and `data/defect_manifest.csv`.

The generator never reads real client or employee information.

## Validate the generated data

Run:

```bash
node scripts/validate_synthetic_data.mjs
```

The validator checks exact row counts, identifier uniqueness, date formats, billable-amount calculations, the defect manifest, and the expected affected-record count for DQ001 through DQ010.

## Validate the SQL foundation locally

Run:

```bash
node scripts/validate_sql_foundation.mjs
```

This performs structural checks on the database and table scripts. It does not replace executing the scripts in SQL Server on Windows.
