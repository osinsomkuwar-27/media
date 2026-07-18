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
  getAccessUrl,
  unlock,
} from '../controllers/media.controller.js';

const router = Router();

// Public-by-design: React Native <Image> cannot reliably attach
// Authorization headers on Android, so these two routes carry their
// own authorization mechanism instead of relying on the header.
// - /preview requires no purchase, so it's safe to serve openly.
// - /access requires a short-lived, media-scoped signed token
//   (issued only after ownership/purchase is verified by /access-url).
router.get('/:id/preview', streamPreview);
router.get('/:id/access', accessOriginal);

router.use(protect);

router.post('/', upload.single('image'), validate(uploadMediaSchema), uploadMedia);
router.get('/', listMedia);
router.get('/:id', getMedia);
router.get('/:id/access-url', getAccessUrl);
router.post('/:id/unlock', unlock);

export default router;