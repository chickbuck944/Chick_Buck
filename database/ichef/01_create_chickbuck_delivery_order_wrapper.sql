/*
  Chick Buck -> iChef native Home Delivery wrapper

  REVIEW BEFORE RUNNING. Run once in SSMS while connected as a database owner
  to ICHEF_LIVE. This file does not run automatically from the website.

  Security design:
  - The website SQL login receives EXECUTE only on this wrapper.
  - The wrapper deliberately permits only delivery order creation.
  - Do NOT grant chickbuck_api EXECUTE on SP_iRESTAURANT_Invoice or
    SP_iRESTAURANT_CustomerMaster directly: those procedures expose many
    unrelated update/delete flags.

  Operational note:
  - This creates the native hold-invoice/KOT records through Flag 19.
  - Confirm one supervised test KOT reaches each configured kitchen printer
    before enabling website orders for customers.
*/

USE ICHEF_LIVE;
GO

IF OBJECT_ID(N'dbo.usp_ChickBuck_CreateDeliveryOrder', N'P') IS NOT NULL
BEGIN
    RAISERROR('dbo.usp_ChickBuck_CreateDeliveryOrder already exists. Stop and review it; this script will not replace it.', 16, 1);
    RETURN;
END;
GO

CREATE PROCEDURE dbo.usp_ChickBuck_CreateDeliveryOrder
    @CustomerName nvarchar(200),
    @Phone nvarchar(50),
    @Address nvarchar(max),
    @Items xml,
    @Remarks nvarchar(max) = NULL,
    @SectionId bigint = 4,
    @TransactionId bigint OUTPUT,
    @TableNo varchar(50) OUTPUT,
    @KOTNumber bigint OUTPUT
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF NULLIF(LTRIM(RTRIM(@CustomerName)), N'') IS NULL
       OR NULLIF(LTRIM(RTRIM(@Phone)), N'') IS NULL
       OR NULLIF(LTRIM(RTRIM(@Address)), N'') IS NULL
    BEGIN
        RAISERROR('Customer name, phone and address are required.', 16, 1);
        RETURN;
    END;

    DECLARE @RequestedItems TABLE (
        SortOrder int IDENTITY(1, 1) NOT NULL,
        Barcode nvarchar(40) NOT NULL,
        Quantity numeric(16, 3) NOT NULL
    );

    INSERT INTO @RequestedItems (Barcode, Quantity)
    SELECT
        ItemNode.value('(Barcode/text())[1]', 'nvarchar(40)'),
        ItemNode.value('(Quantity/text())[1]', 'numeric(16,3)')
    FROM @Items.nodes('/Items/Item') AS Requested(ItemNode);

    IF NOT EXISTS (SELECT 1 FROM @RequestedItems)
       OR EXISTS (SELECT 1 FROM @RequestedItems WHERE Quantity <= 0 OR Barcode = N'')
    BEGIN
        RAISERROR('At least one valid item is required.', 16, 1);
        RETURN;
    END;

    /* Only currently-approved Chick Buck website items may be ordered. */
    IF EXISTS (
        SELECT 1
        FROM @RequestedItems
        WHERE Barcode NOT IN (
            N'2', N'3', N'4', N'5', N'6', N'7', N'8', N'C4', N'C5', N'C6',
            N'10101042', N'301', N'9', N'10101041', N'10', N'11', N'12', N'13',
            N'14', N'15', N'10101043', N'17', N'18', N'19', N'21', N'22', N'23',
            N'27', N'29', N'142', N'143', N'144', N'145', N'148', N'150', N'154'
        )
    )
    BEGIN
        RAISERROR('One or more requested products are not approved for the Chick Buck website.', 16, 1);
        RETURN;
    END;

    BEGIN TRANSACTION;

    DECLARE @AppLockResult int;
    EXEC @AppLockResult = sys.sp_getapplock
        @Resource = N'ChickBuck:NativeDeliveryOrder',
        @LockMode = N'Exclusive',
        @LockOwner = N'Transaction',
        @LockTimeout = 5000;

    IF @AppLockResult < 0
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR('Another website order is being processed. Please retry.', 16, 1);
        RETURN;
    END;

    DECLARE @LoginId bigint;
    DECLARE @EmployeeId bigint;
    DECLARE @CounterNumber varchar(50);

    SELECT TOP (1)
        @LoginId = LoginId,
        @EmployeeId = EmployeeId,
        @CounterNumber = CONVERT(varchar(50), CounterNumber)
    FROM dbo.DB_iRESTAURANT_Invoice_Login_Details WITH (UPDLOCK, HOLDLOCK)
    WHERE ISNULL(CounterClosed, 0) = 0
    ORDER BY LoginId DESC;

    IF @LoginId IS NULL OR @EmployeeId IS NULL OR @CounterNumber IS NULL
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR('No open iChef counter is available.', 16, 1);
        RETURN;
    END;

    SELECT TOP (1) @TableNo = Tables.TableNo
    FROM dbo.DB_iRESTAURANT_TableMaster AS Tables WITH (UPDLOCK, HOLDLOCK)
    WHERE Tables.SectionId = @SectionId
      AND Tables.Active = 1
      AND Tables.TableNo IN (
          'WB-1', 'WB-2', 'WB-3', 'WB-4', 'WB-5', 'WB-6', 'WB-7', 'WB-8',
          'WB-9', 'WB-10', 'WB-11', 'WB-12', 'WB-13', 'WB-14', 'WB-15'
      )
      AND NOT EXISTS (
          SELECT 1
          FROM dbo.DB_iRESTAURANT_HoldInvoice_Header AS Holds WITH (UPDLOCK, HOLDLOCK)
          WHERE Holds.TableNo = Tables.TableNo
            AND Holds.Active = 1
            AND (Holds.Purpose IS NULL OR Holds.Purpose <> 'SETTLED')
      )
    ORDER BY CAST(REPLACE(Tables.TableNo, 'WB-', '') AS int);

    IF @TableNo IS NULL
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR('No WB delivery slot is available.', 16, 1);
        RETURN;
    END;

    DECLARE @CustomerId bigint;
    SELECT TOP (1) @CustomerId = CustomerId
    FROM dbo.DB_iRESTAURANT_CustomerMaster WITH (UPDLOCK, HOLDLOCK)
    WHERE Phone = @Phone
    ORDER BY CustomerId DESC;

    IF @CustomerId IS NULL
    BEGIN
        EXEC dbo.SP_iRESTAURANT_CustomerMaster
            @Flag = 1,
            @CustomerName = @CustomerName,
            @Address = @Address,
            @Phone = @Phone,
            @Remarks = @Remarks,
            @CustomerIdOut = @CustomerId OUTPUT;
    END;

    IF @CustomerId IS NULL OR @CustomerId = 0
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR('iChef could not create the customer.', 16, 1);
        RETURN;
    END;

    DECLARE @MissingItems int;
    SELECT @MissingItems = COUNT(*)
    FROM @RequestedItems AS Requested
    LEFT JOIN dbo.ViewAllItemDetails AS ItemDetails
      ON ItemDetails.Barcode = Requested.Barcode
    WHERE ItemDetails.Barcode IS NULL;

    IF @MissingItems > 0
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR('An approved website product is missing from the iChef item catalogue.', 16, 1);
        RETURN;
    END;

    DECLARE @NativeItems xml;
    SELECT @NativeItems = (
        SELECT
            Requested.SortOrder AS [SortOrderNumber],
            ItemDetails.Barcode AS [BarCode],
            ItemDetails.ItemName AS [ItemName],
            ISNULL(ItemDetails.AltItemName, N'') AS [AltItemName],
            ItemDetails.ItemCode AS [ItemCode],
            ISNULL(ItemDetails.ItemShortDesc, N'') AS [ItemShortDesc],
            ISNULL(ItemDetails.AltItemShortDesc, N'') AS [AltItemShortDesc],
            CONVERT(numeric(16, 3), 0) AS [ParscalCharge],
            CONVERT(numeric(16, 4), ROUND(ItemDetails.UnitPrice / (1 + (ISNULL(Vat.Tax, 0) / 100.0)), 4)) AS [UnitPrice],
            CONVERT(numeric(16, 4), ROUND((ItemDetails.UnitPrice * Requested.Quantity) - (ROUND(ItemDetails.UnitPrice / (1 + (ISNULL(Vat.Tax, 0) / 100.0)), 4) * Requested.Quantity), 4)) AS [TotalTax],
            Requested.Quantity AS [Quantity],
            CONVERT(numeric(16, 4), ROUND(ItemDetails.UnitPrice * Requested.Quantity, 4)) AS [Total],
            N'PIECES' AS [UOMName],
            ItemDetails.KitchenId AS [KitchenId],
            /* iChef's kitchen-print service polls unprocessed KOT details. */
            0 AS [KOTProcessed],
            1 AS [BillTypeId],
            N'D' AS [BillTypeCode],
            N'I' AS [ItemType],
            0 AS [MessageId],
            0 AS [PMethodId],
            0 AS [VatId],
            CONVERT(numeric(16, 3), 0) AS [Tax],
            0 AS [StaffId],
            Requested.SortOrder AS [SlNumber]
        FROM @RequestedItems AS Requested
        INNER JOIN dbo.ViewAllItemDetails AS ItemDetails
          ON ItemDetails.Barcode = Requested.Barcode
        LEFT JOIN dbo.DB_iRETSAURANT_VATMaster AS Vat
          ON Vat.VatId = ItemDetails.VatId
        ORDER BY Requested.SortOrder
        FOR XML PATH('mytable'), ROOT('DocumentElement'), TYPE
    );

    DECLARE @Kots TABLE (KOTNumber bigint);
    INSERT INTO @Kots (KOTNumber)
    EXEC dbo.SP_iRESTAURANT_Invoice @Flag = 82;

    SELECT TOP (1) @KOTNumber = KOTNumber FROM @Kots;
    IF @KOTNumber IS NULL OR @KOTNumber = 0
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR('iChef could not allocate a KOT number.', 16, 1);
        RETURN;
    END;

    DECLARE @KOTNumberText varchar(100);
    SET @KOTNumberText = CONVERT(varchar(100), @KOTNumber);

    DECLARE @OrderDateTime datetime;
    SET @OrderDateTime = GETDATE();

    SET @TransactionId = 0;
    EXEC dbo.SP_iRESTAURANT_Invoice
        @Flag = 19,
        @TransactionId = 0,
        @BillNo = 0,
        @CustomerID = @CustomerId,
        @StaffID = 0,
        @DeliveryBoyId = 0,
        @TableNo = @TableNo,
        @BuildingId = 0,
        @RoomNo = N'',
        @IsArea = 1,
        @AreaId = 0,
        @DiscountAmount = 0,
        @PAX = 1,
        @KOTNumber = @KOTNumberText,
        @LoginId = @LoginId,
        @InvoiceCounterNo = @CounterNumber,
        @HoldDateTime = @OrderDateTime,
        @CustomerType = 0,
        @TransactionIdOut = @TransactionId OUTPUT,
        @CreditCardId = 0,
        @CreditCardNo = N'',
        @IsPrintBill = 0,
        @EmployeeId = @EmployeeId,
        @MobileNumber = @Phone,
        @DiscountPrivilagedBy = 0,
        @DeliveryTime = @OrderDateTime,
        @Remarks = @Remarks,
        @SystemName = N'WEBSITE',
        @XmlData = @NativeItems;

    IF @TransactionId IS NULL OR @TransactionId = 0
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR('iChef did not return a transaction ID.', 16, 1);
        RETURN;
    END;

    COMMIT TRANSACTION;

    SELECT
        @TransactionId AS TransactionId,
        @TableNo AS TableNo,
        @KOTNumber AS KOTNumber,
        @CustomerId AS CustomerId;
END;
GO

GRANT EXECUTE ON dbo.usp_ChickBuck_CreateDeliveryOrder TO chickbuck_api;
GO
