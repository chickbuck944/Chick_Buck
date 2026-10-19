import { ICHEF_WB_SECTION_ID, isIchefConfigured, isIchefTestMode } from '../config/ichef.js';
import { ichefProductMap } from '../config/ichefProductMap.js';
import { checkIchefConnection, getWbSlotAvailability } from '../services/ichefSqlService.js';

export const health = async (request, response) => {
  if (!isIchefConfigured()) return response.json({ success: true, status: 'not_configured', testMode: isIchefTestMode() });
  try {
    await checkIchefConnection();
    return response.json({ success: true, status: 'connected', testMode: isIchefTestMode() });
  } catch {
    return response.status(503).json({ success: false, code: 'ICHEF_CONNECTION_ERROR', message: 'Unable to connect to iChef.' });
  }
};

export const products = (request, response) => response.json({ success: true, products: Object.entries(ichefProductMap).map(([productId, item]) => ({ productId, ...item })) });

export const wbSlots = async (request, response) => {
  if (!isIchefConfigured()) {
    return response.status(503).json({ success: false, code: 'ICHEF_NOT_CONFIGURED' });
  }
  try {
    const slots = await getWbSlotAvailability({ sectionId: ICHEF_WB_SECTION_ID });
    return response.json({ success: true, testMode: isIchefTestMode(), slots });
  } catch {
    return response.status(503).json({ success: false, code: 'ICHEF_CONNECTION_ERROR', message: 'Unable to read iChef WB slot availability.' });
  }
};
