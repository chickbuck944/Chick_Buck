import { ICHEF_WB_SECTION_ID } from '../config/ichef.js';
import { ichefProductMap } from '../config/ichefProductMap.js';
import { createNativeDeliveryOrder } from './ichefSqlService.js';

const createError = (message, statusCode = 422) => Object.assign(new Error(message), { statusCode });

const xmlEscape = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const buildItemsXml = (items) => {
  const normalized = items.map((item) => {
    const product = ichefProductMap[item.id];
    if (!product?.barcode) throw createError(`The item "${item.id}" is not mapped to iChef.`);
    return { barcode: product.barcode, quantity: Number(item.quantity) };
  });

  return `<Items>${normalized.map((item) => (
    `<Item><Barcode>${xmlEscape(item.barcode)}</Barcode><Quantity>${item.quantity}</Quantity></Item>`
  )).join('')}</Items>`;
};

export const createNativeIchefDeliveryOrder = async ({ orderType, items, deliveryDetails }) => {
  if (orderType !== 'DELIVERY') {
    throw createError('Native iChef ordering is available for delivery orders only.');
  }

  const result = await createNativeDeliveryOrder({
    customerName: deliveryDetails.customerName.trim(),
    phone: deliveryDetails.phone.trim(),
    address: deliveryDetails.address.trim(),
    itemsXml: buildItemsXml(items),
    remarks: deliveryDetails.specialRequests?.trim() || null,
    sectionId: ICHEF_WB_SECTION_ID
  });

  if (!result.TransactionId || !result.TableNo || !result.KOTNumber) {
    throw createError('iChef did not return a native transaction, WB slot and KOT number.', 502);
  }

  return {
    ichefOrder: true,
    transactionId: Number(result.TransactionId),
    wbSlot: result.TableNo,
    kotNumber: Number(result.KOTNumber)
  };
};
