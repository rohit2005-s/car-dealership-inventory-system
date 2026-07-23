import { Router } from 'express';
import authRoutes from './auth.routes';
import vehicleRoutes from './vehicle.routes';

const router = Router();

// Health check — useful for deployment platforms (Render/Railway) to verify uptime
router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy' });
});

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);

export default router;
