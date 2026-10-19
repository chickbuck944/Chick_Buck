import Razorpay from 'razorpay';

// Create the SDK lazily. This allows the API to boot for health checks and
// tests even when payment credentials are intentionally absent.
let razorpayClient;

export const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
    const error = new Error('Razorpay credentials are not configured');
    error.statusCode = 503;
    throw error;
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET
    });
  }
  return razorpayClient;
};
