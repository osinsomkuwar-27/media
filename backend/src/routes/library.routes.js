import { Router } from 'express';
import protect from '../middleware/auth.middleware.js';
import { getLibrary } from '../controllers/library.controller.js';

const router = Router();

router.get('/', protect, getLibrary);

export default router;