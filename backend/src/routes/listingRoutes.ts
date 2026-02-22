import { Router } from 'express';
import * as listingController from '../controllers/listingController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', listingController.getAllListings);
router.get('/:id', listingController.getListing);

// Protected routes
router.use(protect);
router.post('/', listingController.createListing);
router.patch('/:id', listingController.updateListing);
router.delete('/:id', listingController.deleteListing);

export default router;
