import axios from 'axios';

export const dispatchOrder = async (order) => {
  if (!process.env.ICHEF_API_URL) {
    throw new Error('ICHEF_API_URL is not configured');
  }

  const response = await axios.post(
    process.env.ICHEF_API_URL,
    {
      orderId: order.id,
      orderType: order.order_type,
      outletId: order.outlet_id,
      tableNumber: order.table_number,
      deliveryDetails: order.delivery_details,
      items: order.items,
      totalAmount: Number(order.total_amount),
      paymentStatus: order.status
    },
    {
      timeout: Number(process.env.ICHEF_API_TIMEOUT_MS || 5000),
      headers: {
        Authorization: `Bearer ${process.env.ICHEF_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};
