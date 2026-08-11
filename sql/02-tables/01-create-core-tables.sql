/*
    ClientIQ BI Platform
    Script: 01-create-core-tables.sql
    Purpose: Create the six approved MVP tables, compatible constraints, and indexes.

    Important data-quality design:
    - Source-facing tables intentionally preserve controlled defects.
    - MatterID is not unique because DQ002 must detect duplicates.
    - Foreign keys are not enforced on source identifiers because DQ001, DQ003,
      and DQ007 must detect missing or orphan references after loading.
    - Constraints remain in place for categorical fields not used by those tests.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

USE [ClientIQ];
GO

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'[clientiq].[Clients]', N'U') IS NULL
    BEGIN
        CREATE TABLE [clientiq].[Clients]
        (
            [ClientID]       varchar(10)    NOT NULL,
            [ClientName]     nvarchar(150)  NOT NULL,
            [Industry]       nvarchar(100)  NOT NULL,
            [Region]         nvarchar(50)   NOT NULL,
            [ClientStatus]   varchar(20)    NOT NULL,
            [StartDate]      date           NOT NULL,
            [LoadedAtUTC]    datetime2(0)   NOT NULL
                CONSTRAINT [DF_Clients_LoadedAtUTC] DEFAULT (SYSUTCDATETIME()),

            CONSTRAINT [PK_Clients]
                PRIMARY KEY CLUSTERED ([ClientID]),
            CONSTRAINT [CK_Clients_ClientStatus]
                CHECK ([ClientStatus] IN ('Active', 'Inactive'))
        );
        PRINT N'Table [clientiq].[Clients] created.';
    END
    ELSE
        PRINT N'Table [clientiq].[Clients] already exists; creation skipped.';

    IF OBJECT_ID(N'[clientiq].[Attorneys]', N'U') IS NULL
    BEGIN
        CREATE TABLE [clientiq].[Attorneys]
        (
            [AttorneyID]     varchar(10)    NOT NULL,
            [AttorneyName]   nvarchar(150)  NOT NULL,
            [Office]         nvarchar(100)  NOT NULL,
            [PracticeArea]   nvarchar(100)  NOT NULL,
            [Title]          nvarchar(50)   NOT NULL,
            [BillingRate]    decimal(10,2)  NULL,
            [ActiveFlag]     bit            NOT NULL,
            [LoadedAtUTC]    datetime2(0)   NOT NULL
                CONSTRAINT [DF_Attorneys_LoadedAtUTC] DEFAULT (SYSUTCDATETIME()),

            CONSTRAINT [PK_Attorneys]
                PRIMARY KEY CLUSTERED ([AttorneyID]),
            CONSTRAINT [CK_Attorneys_Title]
                CHECK ([Title] IN (N'Partner', N'Counsel', N'Associate')),
            CONSTRAINT [CK_Attorneys_BillingRate]
                CHECK ([BillingRate] IS NULL OR [BillingRate] >= 0)
        );
        PRINT N'Table [clientiq].[Attorneys] created.';
    END
    ELSE
        PRINT N'Table [clientiq].[Attorneys] already exists; creation skipped.';

    IF OBJECT_ID(N'[clientiq].[Matters]', N'U') IS NULL
    BEGIN
        CREATE TABLE [clientiq].[Matters]
        (
            [MatterRowID]     bigint         IDENTITY(1,1) NOT NULL,
            [MatterID]        varchar(12)    NOT NULL,
            [ClientID]        varchar(10)    NULL,
            [MatterName]      nvarchar(200)  NOT NULL,
            [PracticeArea]    nvarchar(100)  NOT NULL,
            [LeadAttorneyID]  varchar(10)    NULL,
            [OpenDate]        date           NOT NULL,
            [CloseDate]       date           NULL,
            [MatterStatus]    varchar(20)    NOT NULL,
            [BudgetAmount]    decimal(14,2)  NOT NULL,
            [LoadedAtUTC]     datetime2(0)   NOT NULL
                CONSTRAINT [DF_Matters_LoadedAtUTC] DEFAULT (SYSUTCDATETIME()),

            CONSTRAINT [PK_Matters]
                PRIMARY KEY CLUSTERED ([MatterRowID]),
            CONSTRAINT [CK_Matters_MatterStatus]
                CHECK ([MatterStatus] IN ('Active', 'Closed', 'On Hold')),
            CONSTRAINT [CK_Matters_BudgetAmount]
                CHECK ([BudgetAmount] >= 0)
        );
        PRINT N'Table [clientiq].[Matters] created.';
    END
    ELSE
        PRINT N'Table [clientiq].[Matters] already exists; creation skipped.';

    IF OBJECT_ID(N'[clientiq].[TimeEntries]', N'U') IS NULL
    BEGIN
        CREATE TABLE [clientiq].[TimeEntries]
        (
            [TimeEntryID]    varchar(15)    NOT NULL,
            [MatterID]       varchar(12)    NULL,
            [AttorneyID]     varchar(10)    NOT NULL,
            [WorkDate]       date           NOT NULL,
            [HoursWorked]    decimal(5,2)   NOT NULL,
            [BillingRate]    decimal(10,2)  NULL,
            [BillableAmount] decimal(14,2)  NULL,
            [Description]    nvarchar(250)  NOT NULL,
            [LoadedAtUTC]    datetime2(0)   NOT NULL
                CONSTRAINT [DF_TimeEntries_LoadedAtUTC] DEFAULT (SYSUTCDATETIME()),

            CONSTRAINT [PK_TimeEntries]
                PRIMARY KEY CLUSTERED ([TimeEntryID])
        );
        PRINT N'Table [clientiq].[TimeEntries] created.';
    END
    ELSE
        PRINT N'Table [clientiq].[TimeEntries] already exists; creation skipped.';

    IF OBJECT_ID(N'[clientiq].[Invoices]', N'U') IS NULL
    BEGIN
        CREATE TABLE [clientiq].[Invoices]
        (
            [InvoiceID]      varchar(15)    NOT NULL,
            [MatterID]       varchar(12)    NOT NULL,
            [InvoiceDate]    date           NOT NULL,
            [InvoiceAmount]  decimal(14,2)  NOT NULL,
            [InvoiceStatus]  varchar(20)    NOT NULL,
            [PaymentDate]    date           NULL,
            [LoadedAtUTC]    datetime2(0)   NOT NULL
                CONSTRAINT [DF_Invoices_LoadedAtUTC] DEFAULT (SYSUTCDATETIME()),

            CONSTRAINT [PK_Invoices]
                PRIMARY KEY CLUSTERED ([InvoiceID]),
            CONSTRAINT [CK_Invoices_InvoiceStatus]
                CHECK ([InvoiceStatus] IN ('Draft', 'Submitted', 'Paid', 'Overdue'))
        );
        PRINT N'Table [clientiq].[Invoices] created.';
    END
    ELSE
        PRINT N'Table [clientiq].[Invoices] already exists; creation skipped.';

    IF OBJECT_ID(N'[clientiq].[DataQualityIssues]', N'U') IS NULL
    BEGIN
        CREATE TABLE [clientiq].[DataQualityIssues]
        (
            [IssueID]          bigint           IDENTITY(1,1) NOT NULL,
            [RunID]            uniqueidentifier NOT NULL,
            [RunDate]          datetime2(0)     NOT NULL
                CONSTRAINT [DF_DataQualityIssues_RunDate] DEFAULT (SYSUTCDATETIME()),
            [TableName]        sysname          NOT NULL,
            [RecordID]        varchar(50)      NOT NULL,
            [RuleID]          varchar(10)      NOT NULL,
            [RuleName]        nvarchar(150)    NOT NULL,
            [Severity]        varchar(20)      NOT NULL,
            [IssueDescription] nvarchar(500)   NOT NULL,
            [Status]           varchar(20)      NOT NULL
                CONSTRAINT [DF_DataQualityIssues_Status] DEFAULT ('Open'),

            CONSTRAINT [PK_DataQualityIssues]
                PRIMARY KEY CLUSTERED ([IssueID]),
            CONSTRAINT [CK_DataQualityIssues_RuleID]
                CHECK ([RuleID] IN
                    ('DQ001', 'DQ002', 'DQ003', 'DQ004', 'DQ005',
                     'DQ006', 'DQ007', 'DQ008', 'DQ009', 'DQ010')),
            CONSTRAINT [CK_DataQualityIssues_Severity]
                CHECK ([Severity] IN ('Critical', 'High', 'Medium')),
            CONSTRAINT [CK_DataQualityIssues_Status]
                CHECK ([Status] IN ('Open', 'Resolved', 'Accepted'))
        );
        PRINT N'Table [clientiq].[DataQualityIssues] created.';
    END
    ELSE
        PRINT N'Table [clientiq].[DataQualityIssues] already exists; creation skipped.';

    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.indexes
        WHERE [object_id] = OBJECT_ID(N'[clientiq].[Matters]')
          AND [name] = N'IX_Matters_MatterID'
    )
        CREATE NONCLUSTERED INDEX [IX_Matters_MatterID]
            ON [clientiq].[Matters] ([MatterID]);

    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.indexes
        WHERE [object_id] = OBJECT_ID(N'[clientiq].[Matters]')
          AND [name] = N'IX_Matters_ClientID_Status'
    )
        CREATE NONCLUSTERED INDEX [IX_Matters_ClientID_Status]
            ON [clientiq].[Matters] ([ClientID], [MatterStatus])
            INCLUDE ([MatterID], [PracticeArea], [LeadAttorneyID], [BudgetAmount]);

    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.indexes
        WHERE [object_id] = OBJECT_ID(N'[clientiq].[TimeEntries]')
          AND [name] = N'IX_TimeEntries_MatterID_WorkDate'
    )
        CREATE NONCLUSTERED INDEX [IX_TimeEntries_MatterID_WorkDate]
            ON [clientiq].[TimeEntries] ([MatterID], [WorkDate])
            INCLUDE ([AttorneyID], [HoursWorked], [BillingRate], [BillableAmount]);

    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.indexes
        WHERE [object_id] = OBJECT_ID(N'[clientiq].[TimeEntries]')
          AND [name] = N'IX_TimeEntries_AttorneyID_WorkDate'
    )
        CREATE NONCLUSTERED INDEX [IX_TimeEntries_AttorneyID_WorkDate]
            ON [clientiq].[TimeEntries] ([AttorneyID], [WorkDate])
            INCLUDE ([MatterID], [HoursWorked], [BillingRate], [BillableAmount]);

    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.indexes
        WHERE [object_id] = OBJECT_ID(N'[clientiq].[Invoices]')
          AND [name] = N'IX_Invoices_MatterID_InvoiceDate'
    )
        CREATE NONCLUSTERED INDEX [IX_Invoices_MatterID_InvoiceDate]
            ON [clientiq].[Invoices] ([MatterID], [InvoiceDate])
            INCLUDE ([InvoiceAmount], [InvoiceStatus], [PaymentDate]);

    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.indexes
        WHERE [object_id] = OBJECT_ID(N'[clientiq].[DataQualityIssues]')
          AND [name] = N'IX_DataQualityIssues_RunID_Severity'
    )
        CREATE NONCLUSTERED INDEX [IX_DataQualityIssues_RunID_Severity]
            ON [clientiq].[DataQualityIssues] ([RunID], [Severity])
            INCLUDE ([RuleID], [TableName], [RecordID], [Status]);

    COMMIT TRANSACTION;
    PRINT N'ClientIQ core table foundation is ready.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO

SELECT
    s.[name] AS SchemaName,
    t.[name] AS TableName,
    SUM(p.[rows]) AS RowCount
FROM sys.tables AS t
INNER JOIN sys.schemas AS s
    ON s.[schema_id] = t.[schema_id]
INNER JOIN sys.partitions AS p
    ON p.[object_id] = t.[object_id]
   AND p.[index_id] IN (0, 1)
WHERE s.[name] = N'clientiq'
GROUP BY
    s.[name],
    t.[name]
ORDER BY
    t.[name];
GO
