import { Router } from 'express';
import { health, products, wbSlots } from '../controllers/ichefController.js';
import { requireAdminKey } from '../middleware/requireAdminKey.js';

const router = Router();
router.get('/health', requireAdminKey, health);
router.get('/wb-slots', requireAdminKey, wbSlots);
router.get('/products', products);
export default router;
