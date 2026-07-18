import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

let bucket = null;

// Lazily created because mongoose.connection.db only exists
// after the connection is established (Phase 2's connectDB()).
export function getBucket() {
  if (!bucket) {
    bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'media' });
  }
  return bucket;
}