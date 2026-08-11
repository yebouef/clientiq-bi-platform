# Synthetic Data Package

- `raw/` contains the five complete CSV files used by SQL Server.
- `sample/` contains ten-row previews for quick repository review.
- `defect_manifest.csv` documents every intentionally affected record and its expected DQ rule.

The data is deterministic and entirely fictional. Run `node scripts/generate_synthetic_data.mjs` from the repository root to rebuild it.
