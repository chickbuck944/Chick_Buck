import crypto from 'node:crypto';
import * as orderRepository from '../repositories/orderRepository.js';
import { createOrder as createRazorpayOrder, verifyPaymentSignature } from './razorpayService.js';
import { createFullRefund } from './razorpayService.js';
import { dispatchOrder } from './ichefService.js';
import { findDeliveryOutlet } from './deliveryService.js';
import { getDeliveryCharges } from '../config/deliveryPricing.js';
import { isLocalIchefTestOrderEnabled, isNativeIchefOrderEnabled } from '../config/ichef.js';
import { createLocalTestOrder } from './ichefTestOrderService.js';
import { createNativeIchefDeliveryOrder } from './ichefNativeOrderService.js';

export const createOrder = async ({ tableNumber, items, totalAmount, orderType = 'TABLE', deliveryDetails }) => {
  if (isNativeIchefOrderEnabled()) {
    return createNativeIchefDeliveryOrder({ orderType, items, deliveryDetails });
  }
  if (isLocalIchefTestOrderEnabled()) {
    return createLocalTestOrder({ orderType, items, deliveryDetails });
  }
  const deliveryAssignment = orderType === 'DELIVERY'
    ? findDeliveryOutlet(deliveryDetails)
    : null;
  if (deliveryAssignment && !deliveryAssignment.available) {
    const error = new Error("Sorry, Chick Buck doesn't deliver to your location yet.");
    error.statusCode = 422;
    throw error;
  }
  const productTotal = Number(totalAmount);
  const charges = orderType === 'DELIVERY'
    ? getDeliveryCharges(deliveryAssignment.distanceKm)
    : { deliveryFee: 0, packingFee: 0 };
  const finalTotalAmount = productTotal + charges.deliveryFee + charges.packingFee;
  const savedDeliveryDetails = deliveryDetails
    ? {
        ...deliveryDetails,
        billing: {
          productTotal,
          deliveryFee: charges.deliveryFee,
          packingFee: charges.packingFee,
          totalAmount: finalTotalAmount
        }
      }
    : undefined;
  const orderId = crypto.randomUUID();
  const order = await orderRepository.createPendingOrder({
    id: orderId,
    tableNumber: orderType === 'DELIVERY' ? 'DELIVERY' : tableNumber,
    items,
    totalAmount: finalTotalAmount,
    orderType,
    deliveryDetails: savedDeliveryDetails,
    outletId: deliveryAssignment?.outlet.id || null
  });

  try {
    const razorpayOrder = await createRazorpayOrder({
      amount: finalTotalAmount,
      currency: 'INR',
      receipt: orderId
    });
    await orderRepository.setRazorpayOrderId(orderId, razorpayOrder.id);

    return {
      orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
      , outlet: deliveryAssignment?.outlet,
      billing: { productTotal, ...charges, totalAmount: finalTotalAmount }
    };
  } catch (error) {
    await orderRepository.markOrderFailed(orderId);
    throw error;
  }
};

export const verifyPaymentAndDispatch = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const order = await orderRepository.findByRazorpayOrderId(razorpayOrderId);
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  if (!verifyPaymentSignature({ orderId: razorpayOrderId, paymentId: razorpayPaymentId, signature: razorpaySignature })) {
    const error = new Error('Invalid payment signature');
    error.statusCode = 400;
    throw error;
  }

  if (order.status === 'PAID' && order.ichef_dispatched_at) {
    return { orderId: order.id, status: order.status, dispatched: true };
  }

  // Razorpay order IDs accept only one successful payment. Keep the stored
  // payment ID stable so a retry cannot associate a different payment with it.
  if (order.status === 'PAID' && order.razorpay_payment_id !== razorpayPaymentId) {
    const error = new Error('Payment does not match the completed order');
    error.statusCode = 409;
    throw error;
  }

  const paidOrder = order.status === 'PAID'
    ? order
    : await orderRepository.markPaid({ orderId: order.id, paymentId: razorpayPaymentId });
  if (!paidOrder) {
    const error = new Error('Order cannot be marked as paid');
    error.statusCode = 409;
    throw error;
  }

  await dispatchOrder(paidOrder);
  await orderRepository.markIchefDispatched(paidOrder.id);
  return { orderId: paidOrder.id, status: paidOrder.status, dispatched: true };
};

export const approveCancellationAndRefund = async ({ orderId }) => {
  const order = await orderRepository.findById(orderId);
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }
  if (!['PAID', 'CANCELLATION_REQUESTED'].includes(order.status)) {
    const error = new Error('Only a paid order can be refunded');
    error.statusCode = 409;
    throw error;
  }
  if (!order.razorpay_payment_id) {
    const error = new Error('No captured payment is available to refund');
    error.statusCode = 409;
    throw error;
  }

  if (order.status === 'PAID') {
    await orderRepository.requestCancellation({ orderId: order.id, reason: 'Refund approved by branch staff' });
  }

  const refund = await createFullRefund({ paymentId: order.razorpay_payment_id, orderId: order.id });
  const updatedOrder = await orderRepository.setRefundOutcome({
    orderId: order.id,
    refundId: refund.id,
    refundStatus: refund.status
  });
  return { orderId: updatedOrder.id, status: updatedOrder.status, refundId: refund.id, refundStatus: refund.status };
};
