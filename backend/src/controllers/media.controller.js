import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { validateObjectId } from '../utils/objectId.js';
import Media from '../models/Media.js';
import Purchase from '../models/Purchase.js';
import { createMedia, getFeed, getMediaById } from '../services/media.services.js';
import { unlockMedia } from '../services/unlock.services.js';
import { openDownloadStream } from '../services/storage/gridfs.storage.js';

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

export const accessOriginal = catchAsync(async (req, res) => {
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