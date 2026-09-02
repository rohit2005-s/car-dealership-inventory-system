import { Router } from 'express';
import { getMyPurchases } from '../controllers/purchase.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getMyPurchases);

export default router;