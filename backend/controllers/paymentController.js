import * as orderService from '../services/orderService.js';

export const verifyPayment = async (request, response, next) => {
  try {
    const result = await orderService.verifyPaymentAndDispatch({
      razorpayOrderId: request.body.razorpay_order_id,
      razorpayPaymentId: request.body.razorpay_payment_id,
      razorpaySignature: request.body.razorpay_signature
    });
    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
};