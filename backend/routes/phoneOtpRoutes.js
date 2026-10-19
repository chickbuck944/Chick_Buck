import { Router } from 'express';
import { body } from 'express-validator';
import { sendOtp, verifyOtp } from '../controllers/phoneOtpController.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();
const phone = body('phone').isString().trim().isLength({ min: 10, max: 20 }).withMessage('A phone number is required.');

router.post('/send', [phone], validateRequest, sendOtp);
router.post('/verify', [phone, body('otp').isString().trim().matches(/^\d{4,9}$/).withMessage('Enter the SMS code.')], validateRequest, verifyOtp);

export default router;
