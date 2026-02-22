import { Router } from 'express';
import * as aiController from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// These could be public or protected depending on business needs
// Let's protect them to prevent API abuse
router.use(protect);

router.post('/consultant', aiController.outfitConsultant);
router.post('/visualize', aiController.outfitVisualizer);
router.post('/describe', aiController.autoDescriber);

export default router;
