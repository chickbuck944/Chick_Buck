import crypto from 'node:crypto';
import { getRazorpayClient } from '../config/razorpay.js';

export const createOrder = async ({ amount, currency = 'INR', receipt }) => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
    const error = new Error('Razorpay credentials are not configured');
    error.statusCode = 503;
    throw error;
  }

  const amountInPaise = Math.round(Number(amount) * 100);
  if (!Number.isSafeInteger(amountInPaise) || amountInPaise < 100) {
    const error = new Error('Order amount is invalid');
    error.statusCode = 422;
    throw error;
  }

  return getRazorpayClient().orders.create({
    amount: amountInPaise,
    currency,
    receipt,
    payment_capture: 1
  });
};

export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  if (!process.env.RAZORPAY_SECRET) return false;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (typeof signature !== 'string' || signature.length !== expectedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf8'),
    Buffer.from(signature, 'utf8')
  );
};

export const createFullRefund = async ({ paymentId, orderId }) => {
  const refund = await getRazorpayClient().payments.refund(paymentId, {
    notes: { chickbuck_order_id: orderId, reason: 'Customer cancellation approved' }
  });
  return refund;
};
