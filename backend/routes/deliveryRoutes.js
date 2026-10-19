import { Router } from 'express';
import { body } from 'express-validator';
import { quoteDelivery } from '../controllers/deliveryController.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();
const coordinatesValidator = [
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('latitude must be valid').toFloat(),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('longitude must be valid').toFloat()
];

router.post('/quote', coordinatesValidator, validateRequest, quoteDelivery);
export default router;
