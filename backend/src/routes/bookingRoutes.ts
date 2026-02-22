import { Router } from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/', bookingController.createBooking);
router.get('/my-bookings', bookingController.getMyBookings);
router.patch('/:id/status', bookingController.updateBookingStatus);

export default router;
