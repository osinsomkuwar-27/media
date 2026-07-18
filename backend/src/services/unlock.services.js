import mongoose from 'mongoose';
import Media from '../models/Media.js';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import AppError from '../utils/AppError.js';

export async function unlockMedia({ mediaId, buyerId }) {
  const media = await Media.findById(mediaId);

  if (!media) {
    throw new AppError('Media not found', 404, 'MEDIA_NOT_FOUND');
  }

  if (media.ownerId.toString() === buyerId.toString()) {
    throw new AppError('You cannot purchase your own media', 400, 'CANNOT_PURCHASE_OWN_MEDIA');
  }

  // Fast path: already unlocked, no need to open a transaction at all.
  const existingPurchase = await Purchase.findOne({ buyerId, mediaId: media._id });
  if (existingPurchase) {
    return { alreadyUnlocked: true, purchase: existingPurchase };
  }

  const session = await mongoose.startSession();

  try {
    let outcome;

    await session.withTransaction(async () => {
      const price = media.unlockPrice; // price read from DB only, never from client

      const buyer = await User.findById(buyerId).session(session);
      if (buyer.coinBalance < price) {
        throw new AppError('Insufficient wallet balance', 402, 'INSUFFICIENT_BALANCE');
      }

      // If two concurrent requests both reach this point, only one of
      // these inserts can succeed — the unique compound index on
      // { buyerId, mediaId } on the Purchase model rejects the second
      // with E11000, regardless of timing. That index is the real
      // guarantee against double-charging, not the earlier findOne check.
      const [purchase] = await Purchase.create(
        [{ buyerId, mediaId: media._id, pricePaid: price }],
        { session }
      );

      const creator = await User.findById(media.ownerId).session(session);

      const buyerNewBalance = buyer.coinBalance - price;
      buyer.coinBalance = buyerNewBalance;
      await buyer.save({ session });

      const creatorNewBalance = creator.coinBalance + price;
      creator.coinBalance = creatorNewBalance;
      await creator.save({ session });

      await WalletTransaction.create(
        [{
          userId: buyerId,
          type: 'MEDIA_UNLOCK',
          amount: -price,
          balanceAfter: buyerNewBalance,
          relatedMediaId: media._id,
          relatedPurchaseId: purchase._id,
          description: `Unlocked media: ${media.title}`,
        }],
        { session }
      );

      await WalletTransaction.create(
        [{
          userId: media.ownerId,
          type: 'MEDIA_SALE',
          amount: price,
          balanceAfter: creatorNewBalance,
          relatedMediaId: media._id,
          relatedPurchaseId: purchase._id,
          description: `Sold media: ${media.title}`,
        }],
        { session }
      );

      outcome = { alreadyUnlocked: false, purchase, buyerBalance: buyerNewBalance };
    });

    return outcome;
  } catch (err) {
    if (err.code === 11000) {
      const purchase = await Purchase.findOne({ buyerId, mediaId: media._id });
      return { alreadyUnlocked: true, purchase };
    }
    throw err;
  } finally {
    await session.endSession();
  }
}