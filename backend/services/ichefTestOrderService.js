import { ICHEF_WB_SECTION_ID } from '../config/ichef.js';
import { buildFlag13Payload, resolveIchefItems } from './ichefPayloadService.js';
import { createFlag13Order, getWbSlotAvailability } from './ichefSqlService.js';

const createError = (message, statusCode = 422) => Object.assign(new Error(message), { statusCode });

const compactText = (value, maxLength) => String(value || '')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, maxLength);

const createDeliveryRemarks = (deliveryDetails) => {
  // Flag 13 has a 200-character Remarks parameter. Keep the delivery details
  // together so the native iChef KOT template can print one clear field.
  const parts = [
    'WEBSITE TEST',
    `Name: ${compactText(deliveryDetails.customerName, 45)}`,
    `Phone: ${compactText(deliveryDetails.phone, 25)}`,
    `Address: ${compactText(deliveryDetails.address, 85)}`
  ];
  const note = compactText(deliveryDetails.specialRequests, 30);
  if (note) parts.push(`Note: ${note}`);
  return parts.join(' | ').slice(0, 200);
};

export const createLocalTestOrder = async ({ orderType, items, deliveryDetails }) => {
  if (orderType !== 'DELIVERY') {
    throw createError('Local iChef testing is available for delivery orders only.');
  }

  const mappedItems = resolveIchefItems(items);
  const kitchenIds = [...new Set(mappedItems.map((item) => item.kitchenId))];
  if (kitchenIds.length !== 1 || !kitchenIds[0]) {
    throw createError('For this first test, add only items from one confirmed kitchen. Do not mix food and juice items.');
  }

  const slots = await getWbSlotAvailability({ sectionId: ICHEF_WB_SECTION_ID });
  const selectedSlot = slots.find((slot) => slot.available);
  if (!selectedSlot) throw createError('All WB delivery slots are currently occupied. Please try again later.', 409);

  // The first website KOT succeeded with this native iChef-safe value. Keep
  // the controlled sample minimal while we determine why expanded remarks
  // return success-code 1 without creating a hold invoice.
  const remarks = 'Website local test';
  const payload = buildFlag13Payload({
    wbSlot: selectedSlot.slot,
    customer: { name: deliveryDetails.customerName, phone: deliveryDetails.phone },
    remarks,
    items
  });
  const ichefResult = await createFlag13Order({
    ...payload,
    kitchenId: kitchenIds[0],
    // Flag 13 uses 0 here. The Home Delivery TableMaster section (4) is
    // used only when selecting WB-1 through WB-15 above.
    sectionId: 0
  });
  console.info('iChef Flag 13 local test response', {
    wbSlot: selectedSlot.slot,
    response: ichefResult,
    responseKeys: typeof ichefResult === 'object' && ichefResult ? Object.keys(ichefResult) : []
  });

  // A procedure call without a SQL error is not enough. Verify that iChef
  // created an active HoldInvoice row before telling the browser it was sent.
  const refreshedSlots = await getWbSlotAvailability({ sectionId: ICHEF_WB_SECTION_ID });
  const refreshedSlot = refreshedSlots.find((slot) => slot.slot === selectedSlot.slot);
  if (!refreshedSlot || refreshedSlot.available) {
    throw createError('iChef did not create the delivery order. No KOT was sent.', 502);
  }

  return {
    testOrder: true,
    wbSlot: selectedSlot.slot,
    ichefResult
  };
};
