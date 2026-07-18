import Media from '../models/Media.js';
import Purchase from '../models/Purchase.js';
import AppError from '../utils/AppError.js';
import { uploadBuffer } from './storage/gridfs.storage.js';
import { generatePreview } from './image.service.js';

export async function createMedia({ ownerId, title, description, unlockPrice, file }) {
  const previewBuffer = await generatePreview(file.buffer);

  const originalFileId = await uploadBuffer(
    file.buffer,
    `original-${Date.now()}-${file.originalname}`,
    file.mimetype
  );

  const previewFileId = await uploadBuffer(
    previewBuffer,
    `preview-${Date.now()}-${file.originalname}`,
    'image/jpeg'
  );

  const media = await Media.create({
    ownerId,
    title,
    description,
    previewFileId,
    originalFileId,
    mimeType: file.mimetype,
    unlockPrice,
    status: 'published',
  });

  return media;
}

// Single source of truth for "what a media item looks like in an API
// response" — previewFileId / originalFileId never appear here.
function toSafeMedia(media, { isOwner, isUnlocked }) {
  return {
    id: media._id,
    title: media.title,
    description: media.description,
    creator: { id: media.ownerId._id, name: media.ownerId.name },
    unlockPrice: media.unlockPrice,
    previewUrl: `/api/v1/media/${media._id}/preview`,
    isOwner,
    isUnlocked: isOwner || isUnlocked,
    isLocked: !isOwner && !isUnlocked,
    createdAt: media.createdAt,
  };
}

export async function getFeed({ userId, page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;

  const [mediaList, total] = await Promise.all([
    Media.find({ status: 'published' })
      .populate('ownerId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Media.countDocuments({ status: 'published' }),
  ]);

  const mediaIds = mediaList.map((m) => m._id);
  const purchases = await Purchase.find({ buyerId: userId, mediaId: { $in: mediaIds } });
  const purchasedSet = new Set(purchases.map((p) => p.mediaId.toString()));

  const items = mediaList.map((media) =>
    toSafeMedia(media, {
      isOwner: media.ownerId._id.toString() === userId.toString(),
      isUnlocked: purchasedSet.has(media._id.toString()),
    })
  );

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getMediaById({ mediaId, userId }) {
  const media = await Media.findById(mediaId).populate('ownerId', 'name');

  if (!media) {
    throw new AppError('Media not found', 404, 'MEDIA_NOT_FOUND');
  }

  const isOwner = media.ownerId._id.toString() === userId.toString();
  let isUnlocked = isOwner;

  if (!isOwner) {
    const purchase = await Purchase.findOne({ buyerId: userId, mediaId: media._id });
    isUnlocked = !!purchase;
  }

  return toSafeMedia(media, { isOwner, isUnlocked });
}