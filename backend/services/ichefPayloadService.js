import { ichefProductMap } from '../config/ichefProductMap.js';

const escapeXml = (value = '') => String(value).replace(/[<>&'\"]/g, (character) => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
}[character]));
const element = (name, value) => `<${name}>${escapeXml(value)}</${name}>`;

export const resolveIchefItems = (items = []) => items.map((item) => {
  const mapped = ichefProductMap[item.id];
  if (!mapped) {
    const error = new Error(`Product ${item.id} is not mapped to iChef`);
    error.code = 'PRODUCT_NOT_MAPPED';
    error.statusCode = 422;
    throw error;
  }
  return { ...mapped, quantity: Number(item.quantity) };
});

export const buildFlag13Payload = ({ wbSlot, customer = {}, remarks = 'Website order', items }) => {
  const resolvedItems = resolveIchefItems(items);
  const timestamp = new Date().toISOString().slice(0, 19);
  return {
    flag: 13,
    headerXml: `<DocumentElement><PurchaseHeader>${element('TransactionID', 0)}${element('DateTime', timestamp)}${element('TableNo', wbSlot)}${element('PAX', 1)}${element('EmployeeId', process.env.ICHEF_EMPLOYEE_ID || 0)}${element('CustomerId', 0)}${element('Remarks', remarks)}${element('TabConsPrnName', '')}${element('TabConsMKPrnName', '')}</PurchaseHeader></DocumentElement>`,
    detailsXml: `<DocumentElement>${resolvedItems.map((item) => `<PurchaseDetails>${element('TransactionID', 0)}${element('HoldDetailsId', 0)}${element('BarCode', item.barcode)}${element('UnitPrice', item.unitPrice)}${element('KOTProcessed', 0)}${element('BillTypeId', 1)}${element('MessageId', 0)}${element('Quantity', item.quantity)}${element('TotalTax', item.totalTax || 0)}${element('ItemName', item.itemName)}</PurchaseDetails>`).join('')}</DocumentElement>`,
    customerName: customer.name || '', phone: customer.phone || '', remarks
  };
};
