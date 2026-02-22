import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

// Only Admins can access these routes
router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id', adminController.updateUserStatus);
router.get('/pending-listings', adminController.getPendingListings);

export default router;
