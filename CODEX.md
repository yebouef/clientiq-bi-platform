# ClientIQ Codex Index

This file is an index only. Detailed decisions and active work instructions live in the linked files.

## Project purpose

Build a three-day interview portfolio project that combines automated legal-client reporting with SQL-based data-quality monitoring.

## Authoritative project files

- Requirements: `docs/requirements/mvp-requirements.md`
- Architecture decisions: `.codex/memory/architecture.md`
- Architecture overview: `docs/architecture/solution-architecture.md`
- Data dictionary: `docs/data-dictionary/core-data-dictionary.md`
- Active Day 1 work: `.codex/rules/day-1-build.md`
- Data generator: `scripts/generate_synthetic_data.mjs`
- Data validator: `scripts/validate_synthetic_data.mjs`

## Working rules

1. Use synthetic data only.
2. Keep the MVP achievable in three days.
3. Complete and verify the core SQL and Power BI dashboards before optional features.
4. Keep SQL scripts independently readable and execute them in numbered-folder order.
5. Do not claim that SQL Server or Power BI assets work until they are tested on Windows.
