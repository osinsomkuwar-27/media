import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { validateObjectId } from '../utils/objectId.js';
import Media from '../models/Media.js';
import Purchase from '../models/Purchase.js';
import { createMedia, getFeed, getMediaById } from '../services/media.services.js';
import { unlockMedia } from '../services/unlock.services.js';
import { openDownloadStream } from '../services/storage/gridfs.storage.js';
import { signMediaAccessToken, verifyMediaAccessToken } from '../utils/mediaToken.js';

export const uploadMedia = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('Image file is required', 400, 'FILE_REQUIRED');
  }

  const { title, description, unlockPrice } = req.body;

  const media = await createMedia({
    ownerId: req.user._id,
    title,
    description,
    unlockPrice,
    file: req.file,
  });

  res.status(201).json({
    success: true,
    message: 'Media uploaded successfully',
    data: {
      media: {
        id: media._id,
        title: media.title,
        description: media.description,
        unlockPrice: media.unlockPrice,
        previewUrl: `/api/v1/media/${media._id}/preview`,
        createdAt: media.createdAt,
      },
    },
  });
});

export const listMedia = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const result = await getFeed({ userId: req.user._id, page, limit });

  res.status(200).json({ success: true, data: result });
});

export const getMedia = catchAsync(async (req, res) => {
  validateObjectId(req.params.id, 'media id');
  const media = await getMediaById({ mediaId: req.params.id, userId: req.user._id });

  res.status(200).json({ success: true, data: { media } });
});

export const streamPreview = catchAsync(async (req, res) => {
  validateObjectId(req.params.id, 'media id');
  const media = await Media.findById(req.params.id);

  if (!media) {
    throw new AppError('Media not found', 404, 'MEDIA_NOT_FOUND');
  }

  res.set('Content-Type', 'image/jpeg');
  const downloadStream = openDownloadStream(media.previewFileId);

  downloadStream.on('error', () => {
    if (!res.headersSent) {
      res.status(404).json({ success: false, error: { code: 'FILE_NOT_FOUND', message: 'Preview not found' } });
    }
  });

  downloadStream.pipe(res);
});

// PROTECTED (behind normal JWT). Verifies ownership/purchase ONCE,
// then mints a short-lived, media-scoped token. This is the only
// place authorization for original media is decided.
export const getAccessUrl = catchAsync(async (req, res) => {
  validateObjectId(req.params.id, 'media id');
  const media = await Media.findById(req.params.id);

  if (!media) {
    throw new AppError('Media not found', 404, 'MEDIA_NOT_FOUND');
  }

  const isOwner = media.ownerId.toString() === req.user._id.toString();

  if (!isOwner) {
    const purchase = await Purchase.findOne({ buyerId: req.user._id, mediaId: media._id });
    if (!purchase) {
      throw new AppError('You have not unlocked this media', 403, 'FORBIDDEN');
    }
  }

  const token = signMediaAccessToken(media._id, req.user._id);

  res.status(200).json({
    success: true,
    data: {
      accessUrl: `/api/v1/media/${media._id}/access?token=${token}`,
    },
  });
});

// PUBLIC ROUTE (no JWT middleware) — because <Image> can't reliably
// send an Authorization header. Security instead comes entirely from
// the signed, expiring, media-scoped token issued by getAccessUrl above.
// No ownership/purchase re-check happens here on purpose: that check
// already happened when the token was minted, and re-checking here
// would require the caller to be authenticated again, defeating the
// point of a headerless-Image-compatible URL.
export const accessOriginal = catchAsync(async (req, res) => {
  validateObjectId(req.params.id, 'media id');

  const { token } = req.query;

  if (!token) {
    throw new AppError('Access token is required', 401, 'TOKEN_REQUIRED');
  }

  let decoded;
  try {
    decoded = verifyMediaAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('This access link has expired', 401, 'TOKEN_EXPIRED');
    }
    throw new AppError('Invalid access token', 401, 'INVALID_TOKEN');
  }

  if (decoded.purpose !== 'media_access' || decoded.mediaId !== req.params.id) {
    throw new AppError('This token is not valid for the requested media', 403, 'TOKEN_MEDIA_MISMATCH');
  }

  const media = await Media.findById(req.params.id);

  if (!media) {
    throw new AppError('Media not found', 404, 'MEDIA_NOT_FOUND');
  }

  res.set('Content-Type', media.mimeType);
  const downloadStream = openDownloadStream(media.originalFileId);

  downloadStream.on('error', () => {
    if (!res.headersSent) {
      res.status(404).json({ success: false, error: { code: 'FILE_NOT_FOUND', message: 'Original file not found' } });
    }
  });

  downloadStream.pipe(res);
});

export const unlock = catchAsync(async (req, res) => {
  validateObjectId(req.params.id, 'media id');

  const result = await unlockMedia({ mediaId: req.params.id, buyerId: req.user._id });

  res.status(200).json({
    success: true,
    message: result.alreadyUnlocked ? 'Media already unlocked' : 'Media unlocked successfully',
    data: {
      purchase: {
        id: result.purchase._id,
        mediaId: result.purchase.mediaId,
        pricePaid: result.purchase.pricePaid,
      },
      alreadyUnlocked: result.alreadyUnlocked,
    },
  });
});