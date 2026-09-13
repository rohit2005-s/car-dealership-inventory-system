import { Router } from 'express';
import {
  createVehicle,
  getVehicles,
  searchVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle,
} from '../controllers/vehicle.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

// Public
router.get('/', getVehicles);
router.get('/search', searchVehicles);
router.get('/:id', getVehicleById);

// Admin only
router.post('/', authMiddleware, roleMiddleware('admin'), createVehicle);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateVehicle);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteVehicle);
router.post('/:id/restock', authMiddleware, roleMiddleware('admin'), restockVehicle);

// Authenticated users
router.post('/:id/purchase', authMiddleware, purchaseVehicle);

export default router;
