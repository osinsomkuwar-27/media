import { Router } from 'express';
import protect from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { uploadMediaSchema } from '../validators/media.validator.js';
import {
  uploadMedia,
  listMedia,
  getMedia,
  streamPreview,
  accessOriginal,
  unlock,
} from '../controllers/media.controller.js';

const router = Router();

router.use(protect);

router.post('/', upload.single('image'), validate(uploadMediaSchema), uploadMedia);
router.get('/', listMedia);
router.get('/:id', getMedia);
router.get('/:id/preview', streamPreview);
router.get('/:id/access', accessOriginal);
router.post('/:id/unlock', unlock);

export default router;