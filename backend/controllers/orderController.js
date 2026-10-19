import * as orderService from '../services/orderService.js';
import { isLocalIchefTestOrderEnabled, isNativeIchefOrderEnabled } from '../config/ichef.js';
import { isPhoneOtpRequired } from '../config/phoneOtp.js';
import { consumePhoneVerification } from '../services/phoneOtpService.js';

const isLoopbackRequest = (request) => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(request.ip);

export const createOrder = async (request, response, next) => {
  try {
    if (request.body.orderType === 'DELIVERY' && isPhoneOtpRequired()) {
      consumePhoneVerification({
        phone: request.body.deliveryDetails?.phone,
        verificationToken: request.body.phoneVerificationToken,
        clientId: request.ip || 'unknown'
      });
    }
    if ((isLocalIchefTestOrderEnabled() || isNativeIchefOrderEnabled()) && !isLoopbackRequest(request)) {
      return response.status(403).json({ error: 'Local iChef test orders are allowed only from this computer.' });
    }
    const result = await orderService.createOrder(request.body);
    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const approveCancellation = async (request, response, next) => {
  try {
    response.json(await orderService.approveCancellationAndRefund({ orderId: request.params.orderId }));
  } catch (error) {
    next(error);
  }
};
