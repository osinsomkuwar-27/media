import { Router } from 'express';
import authRoutes from './auth.routes.js';
import mediaRoutes from './media.routes.js';
import walletRoutes from './wallet.routes.js';
import libraryRoutes from './library.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/media', mediaRoutes);
router.use('/wallet', walletRoutes);
router.use('/library', libraryRoutes);

export default router;