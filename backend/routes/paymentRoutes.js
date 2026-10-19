import { Router } from 'express';
import { verifyPayment } from '../controllers/paymentController.js';
import { paymentVerificationValidator } from '../validators/orderValidator.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.post('/verify', paymentVerificationValidator, validateRequest, verifyPayment);

export default router;