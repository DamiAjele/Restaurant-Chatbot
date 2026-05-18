import { Router } from 'express';
import { initializePayment, verifyPayment, webhook } from '../controllers/paymentController';

const router = Router();

router.post('/initialize', initializePayment);
router.get('/verify', verifyPayment);
router.post('/webhook', webhook);

export default router;
