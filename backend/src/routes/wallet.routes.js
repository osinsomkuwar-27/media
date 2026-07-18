import { Router } from 'express';
import protect from '../middleware/auth.middleware.js';
import { getWallet, getTransactions } from '../controllers/wallet.controller.js';

const router = Router();

router.use(protect);

router.get('/', getWallet);
router.get('/transactions', getTransactions);

export default router;