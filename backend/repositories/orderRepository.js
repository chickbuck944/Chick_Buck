import { query } from '../config/db.js';

export const createPendingOrder = async ({ id, tableNumber, items, totalAmount, orderType, deliveryDetails, outletId }) => {
  const result = await query(
    `INSERT INTO orders (id, table_number, items, total_amount, order_type, delivery_details, outlet_id, status)
     VALUES ($1, $2, $3::jsonb, $4, $5, $6::jsonb, $7, 'PENDING')
     RETURNING id, table_number, items, total_amount, order_type, delivery_details, outlet_id, status, created_at`,
    [id, tableNumber, JSON.stringify(items), totalAmount, orderType, deliveryDetails ? JSON.stringify(deliveryDetails) : null, outletId]
  );
  return result.rows[0];
};

export const setRazorpayOrderId = async (orderId, razorpayOrderId) => {
  const result = await query(
    `UPDATE orders SET razorpay_order_id = $2, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [orderId, razorpayOrderId]
  );
  return result.rows[0] || null;
};

export const markOrderFailed = async (orderId) => {
  await query(
    `UPDATE orders SET status = 'FAILED', updated_at = NOW()
     WHERE id = $1 AND status = 'PENDING'`,
    [orderId]
  );
};

export const findByRazorpayOrderId = async (razorpayOrderId) => {
  const result = await query('SELECT * FROM orders WHERE razorpay_order_id = $1', [razorpayOrderId]);
  return result.rows[0] || null;
};

export const markPaid = async ({ orderId, paymentId }) => {
  const result = await query(
    `UPDATE orders
     SET status = 'PAID', razorpay_payment_id = $2, paid_at = COALESCE(paid_at, NOW()), updated_at = NOW()
     WHERE id = $1 AND status = 'PENDING'
     RETURNING *`,
    [orderId, paymentId]
  );
  return result.rows[0] || null;
};

export const markIchefDispatched = async (orderId) => {
  const result = await query(
    `UPDATE orders SET ichef_dispatched_at = NOW(), updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [orderId]
  );
  return result.rows[0] || null;
};

export const findById = async (orderId) => {
  const result = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
  return result.rows[0] || null;
};

export const requestCancellation = async ({ orderId, reason }) => {
  const result = await query(
    `UPDATE orders
     SET status = 'CANCELLATION_REQUESTED', cancellation_reason = $2,
         cancellation_requested_at = NOW(), updated_at = NOW()
     WHERE id = $1 AND status = 'PAID'
     RETURNING *`,
    [orderId, reason || null]
  );
  return result.rows[0] || null;
};

export const setRefundOutcome = async ({ orderId, refundId, refundStatus }) => {
  const status = refundStatus === 'processed' ? 'REFUNDED' : 'REFUND_PENDING';
  const result = await query(
    `UPDATE orders
     SET status = $2, refund_id = $3, refund_status = $4,
         cancelled_at = NOW(), updated_at = NOW()
     WHERE id = $1 AND status = 'CANCELLATION_REQUESTED'
     RETURNING *`,
    [orderId, status, refundId, refundStatus]
  );
  return result.rows[0] || null;
};
