/*
    ClientIQ BI Platform
    Script: 01-create-clientiq-database.sql
    Purpose: Create the ClientIQ SQL Server database and required schemas.

    Safe rerun behavior:
    - Creates the database only when it does not already exist.
    - Creates schemas only when they do not already exist.
    - Does not delete or overwrite existing tables or data.
*/

SET NOCOUNT ON;
GO

USE [master];
GO

IF DB_ID(N'ClientIQ') IS NULL
BEGIN
    PRINT N'Creating database [ClientIQ]...';
    EXEC (N'CREATE DATABASE [ClientIQ];');
    PRINT N'Database [ClientIQ] created.';
END
ELSE
BEGIN
    PRINT N'Database [ClientIQ] already exists; creation skipped.';
END;
GO

ALTER DATABASE [ClientIQ] SET RECOVERY SIMPLE WITH NO_WAIT;
GO

USE [ClientIQ];
GO

IF SCHEMA_ID(N'clientiq') IS NULL
BEGIN
    EXEC (N'CREATE SCHEMA [clientiq] AUTHORIZATION [dbo];');
    PRINT N'Schema [clientiq] created.';
END
ELSE
BEGIN
    PRINT N'Schema [clientiq] already exists; creation skipped.';
END;
GO

IF SCHEMA_ID(N'reporting') IS NULL
BEGIN
    EXEC (N'CREATE SCHEMA [reporting] AUTHORIZATION [dbo];');
    PRINT N'Schema [reporting] created.';
END
ELSE
BEGIN
    PRINT N'Schema [reporting] already exists; creation skipped.';
END;
GO

SELECT
    DB_NAME() AS CurrentDatabase,
    SCHEMA_ID(N'clientiq') AS ClientIQSchemaID,
    SCHEMA_ID(N'reporting') AS ReportingSchemaID;
GO
