import catchAsync from '../utils/catchAsync.js';
import Purchase from '../models/Purchase.js';

export const getLibrary = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [purchases, total] = await Promise.all([
    Purchase.find({ buyerId: req.user._id })
      .populate({ path: 'mediaId', populate: { path: 'ownerId', select: 'name' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Purchase.countDocuments({ buyerId: req.user._id }),
  ]);

  const items = purchases
    .filter((p) => p.mediaId)
    .map((p) => ({
      id: p.mediaId._id,
      title: p.mediaId.title,
      description: p.mediaId.description,
      creator: { id: p.mediaId.ownerId._id, name: p.mediaId.ownerId.name },
      unlockPrice: p.mediaId.unlockPrice,
      previewUrl: `/api/v1/media/${p.mediaId._id}/preview`,
      pricePaid: p.pricePaid,
      purchasedAt: p.createdAt,
    }));

  res.status(200).json({
    success: true,
    data: { items, total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});