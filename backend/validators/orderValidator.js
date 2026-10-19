import { body } from 'express-validator';

const isConsistentTotal = (totalAmount, { req }) => {
  if (!Array.isArray(req.body.items)) return true;

  // Prices must ultimately come from a trusted menu/catalogue service in a
  // real deployment. Until that is wired in, at least reject internally
  // inconsistent client payloads before creating a payment order.
  const calculatedAmount = req.body.items.reduce(
    (sum, item) => sum + (Number(item.price) * Number(item.quantity)),
    0
  );
  return Math.abs(calculatedAmount - Number(totalAmount)) < 0.01;
};

export const createOrderValidator = [
  body('tableNumber')
    .if(body('orderType').not().equals('DELIVERY'))
    .isString().withMessage('tableNumber must be a string')
    .trim().isLength({ min: 1, max: 50 }).withMessage('tableNumber is required and must be at most 50 characters'),
  body('orderType')
    .optional()
    .isIn(['TABLE', 'DELIVERY']).withMessage('orderType must be TABLE or DELIVERY'),
  body('deliveryDetails')
    .if(body('orderType').equals('DELIVERY'))
    .isObject().withMessage('deliveryDetails are required for delivery orders'),
  body('deliveryDetails.customerName')
    .if(body('orderType').equals('DELIVERY'))
    .isString().trim().isLength({ min: 2, max: 100 }).withMessage('delivery customer name is required'),
  body('deliveryDetails.phone')
    .if(body('orderType').equals('DELIVERY'))
    .isString().trim().matches(/^[0-9+() -]{7,20}$/).withMessage('a valid delivery phone number is required'),
  body('phoneVerificationToken')
    .optional()
    .isUUID().withMessage('phoneVerificationToken must be valid'),
  body('deliveryDetails.address')
    .if(body('orderType').equals('DELIVERY'))
    .isString().trim().isLength({ min: 10, max: 500 }).withMessage('a delivery address of at least 10 characters is required'),
  body('deliveryDetails.privacyConsent')
    .if(body('orderType').equals('DELIVERY'))
    .isBoolean().equals(true).withMessage('privacy consent is required for delivery orders'),
  body('deliveryDetails.latitude')
    .if(body('orderType').equals('DELIVERY'))
    .isFloat({ min: -90, max: 90 }).withMessage('delivery GPS latitude is required').toFloat(),
  body('deliveryDetails.longitude')
    .if(body('orderType').equals('DELIVERY'))
    .isFloat({ min: -180, max: 180 }).withMessage('delivery GPS longitude is required').toFloat(),
  body('items')
    .isArray({ min: 1 }).withMessage('items must contain at least one item'),
  body('items.*.id')
    .isString().withMessage('each item id must be a string')
    .trim().isLength({ min: 1, max: 100 }).withMessage('each item id is required'),
  body('items.*.quantity')
    .isInt({ min: 1, max: 100 }).withMessage('each item quantity must be a positive integer')
    .toInt(),
  body('items.*.price')
    .isFloat({ min: 0.01, max: 100000 }).withMessage('each item price must be positive')
    .toFloat(),
  body('totalAmount')
    .isFloat({ min: 0.01, max: 1000000 }).withMessage('totalAmount must be positive')
    .toFloat()
    .custom(isConsistentTotal).withMessage('totalAmount must equal the sum of item prices multiplied by quantities')
];

export const paymentVerificationValidator = [
  body('razorpay_order_id').isString().trim().notEmpty(),
  body('razorpay_payment_id').isString().trim().notEmpty(),
  body('razorpay_signature').isString().trim().notEmpty()
];
