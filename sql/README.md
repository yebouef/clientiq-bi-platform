# SQL Build Order

Run the SQL Server scripts in this order:

1. `01-database`
2. `02-tables`
3. `03-data-load`
4. `04-data-quality`
5. `05-views`
6. `06-stored-procedures`

Each script will have a numeric filename so a new environment can be built in a predictable order. SQL execution remains unverified until the scripts are run on Windows SQL Server.

