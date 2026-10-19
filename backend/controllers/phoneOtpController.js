import { sendPhoneOtp, verifyPhoneOtp } from '../services/phoneOtpService.js';

const clientId = (request) => request.ip || 'unknown';

export const sendOtp = async (request, response, next) => {
  try {
    const result = await sendPhoneOtp({ phone: request.body.phone, clientId: clientId(request) });
    response.status(202).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (request, response, next) => {
  try {
    const result = await verifyPhoneOtp({ phone: request.body.phone, otp: request.body.otp, clientId: clientId(request) });
    response.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
