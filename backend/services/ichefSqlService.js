import sql from 'mssql';
import { ICHEF_WB_SLOTS, ichefConnectionSettings, isIchefConfigured } from '../config/ichef.js';

let poolPromise;

const getPool = async () => {
  if (!isIchefConfigured()) {
    const error = new Error('iChef connection is not configured');
    error.code = 'ICHEF_NOT_CONFIGURED';
    throw error;
  }
  if (!poolPromise) poolPromise = new sql.ConnectionPool(ichefConnectionSettings()).connect();
  try { return await poolPromise; } catch (error) { poolPromise = undefined; throw error; }
};

export const checkIchefConnection = async () => {
  const pool = await getPool();
  await pool.request().query('SELECT 1 AS connected');
  return true;
};

// A WB slot is busy only while its native iChef hold-invoice header is active
// and has not been settled. A NULL Purpose is an open order (as confirmed by
// the WB-1 manual test), so it must remain unavailable.
export const getWbSlotAvailability = async ({ sectionId }) => {
  const pool = await getPool();
  const slotValues = ICHEF_WB_SLOTS
    .map((slot, index) => `('${slot}', ${index + 1})`)
    .join(', ');

  const result = await pool.request()
    .input('sectionId', sql.BigInt, sectionId)
    .query(`
      WITH RequestedSlots (TableNo, SortOrder) AS (
        SELECT SlotValues.TableNo, SlotValues.SortOrder
        FROM (VALUES ${slotValues}) AS SlotValues(TableNo, SortOrder)
      )
      SELECT
        slots.TableNo,
        tables.TableId,
        CAST(CASE
          WHEN tables.TableId IS NULL OR tables.Active <> 1 THEN 0
          WHEN EXISTS (
            SELECT 1
            FROM dbo.DB_iRESTAURANT_HoldInvoice_Header AS holds
            WHERE holds.TableNo = slots.TableNo
              AND holds.Active = 1
              AND (holds.Purpose IS NULL OR holds.Purpose <> 'SETTLED')
          ) THEN 0
          ELSE 1
        END AS bit) AS Available
      FROM RequestedSlots AS slots
      LEFT JOIN dbo.DB_iRESTAURANT_TableMaster AS tables
        ON tables.TableNo = slots.TableNo
       AND tables.SectionId = @sectionId
      ORDER BY slots.SortOrder;
    `);

  return result.recordset.map((slot) => ({
    slot: slot.TableNo,
    tableId: slot.TableId === null ? null : Number(slot.TableId),
    available: Boolean(slot.Available)
  }));
};

export const createFlag13Order = async ({ headerXml, detailsXml, customerName, phone, remarks, kitchenId, sectionId }) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('Flag', sql.BigInt, 13)
    .input('UserId', sql.NVarChar(50), '')
    .input('Password', sql.NVarChar(50), '')
    .input('CategoryId', sql.BigInt, 0)
    .input('SectionId', sql.BigInt, sectionId)
    .input('TransactionId', sql.BigInt, 0)
    .input('H1', sql.NText, headerXml)
    .input('D1', sql.NText, detailsXml)
    .input('CustomerId', sql.BigInt, 0)
    .input('QuestionId', sql.BigInt, 0)
    .input('Remarks', sql.NVarChar(200), remarks)
    .input('Answer', sql.BigInt, 0)
    .input('CustomerName', sql.NVarChar(50), customerName)
    .input('Phone', sql.NVarChar(30), phone)
    .input('DOB', sql.DateTime, null)
    .input('Language', sql.NVarChar(20), 'en')
    .input('LoginId', sql.BigInt, 0)
    .input('PrintOrDetails', sql.BigInt, 0)
    .input('SysName', sql.NVarChar(50), 'WEBSITE')
    .input('KitchenId', sql.BigInt, kitchenId)
    .execute('dbo.SP_iRESTAURANT_WebService');

  return result.recordset?.[0] || {};
};

export const createNativeDeliveryOrder = async ({ customerName, phone, address, itemsXml, remarks, sectionId }) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('CustomerName', sql.NVarChar(200), customerName)
    .input('Phone', sql.NVarChar(50), phone)
    .input('Address', sql.NVarChar(sql.MAX), address)
    .input('Items', sql.Xml, itemsXml)
    .input('Remarks', sql.NVarChar(sql.MAX), remarks || null)
    .input('SectionId', sql.BigInt, sectionId)
    .output('TransactionId', sql.BigInt)
    .output('TableNo', sql.VarChar(50))
    .output('KOTNumber', sql.BigInt)
    .execute('dbo.usp_ChickBuck_CreateDeliveryOrder');

  // Flag 82 and Flag 19 can each emit their own result set. The wrapper's
  // final SELECT is the one containing these three fields, not necessarily
  // mssql's first `recordset`.
  const wrapperRow = (result.recordsets || [])
    .flat()
    .reverse()
    .find((row) => row.TransactionId && row.TableNo && row.KOTNumber);

  return wrapperRow || result.output || {};
};
