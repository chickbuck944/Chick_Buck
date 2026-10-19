import { Router } from 'express';
import { createOrder, approveCancellation } from '../controllers/orderController.js';
import { createOrderValidator } from '../validators/orderValidator.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { requireAdminKey } from '../middleware/requireAdminKey.js';
import { param } from 'express-validator';

const router = Router();

router.post('/', createOrderValidator, validateRequest, createOrder);
router.post('/:orderId/refund', [param('orderId').isUUID()], validateRequest, requireAdminKey, approveCancellation);

export default router;
