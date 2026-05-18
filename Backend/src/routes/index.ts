import { Router } from 'express';
import sessionRoutes from './sessionRoutes';
import chatRoutes from './chatRoutes';
import paymentRoutes from './paymentRoutes';

const router = Router();

router.use('/session', sessionRoutes);
router.use('/chat', chatRoutes);
router.use('/payment', paymentRoutes);

export default router;
