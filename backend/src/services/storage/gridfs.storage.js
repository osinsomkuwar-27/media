import { Readable } from 'stream';
import mongoose from 'mongoose';
import { getBucket } from '../../config/gridfs.js';

// This is the storage abstraction. Controllers/services only ever
// call uploadBuffer / openDownloadStream / deleteFile — never touch
// GridFS or the mongodb driver directly. Swapping to s3rver or S3
// later means writing a new file with this same interface.

export async function uploadBuffer(buffer, filename, contentType) {
  const bucket = getBucket();
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, { contentType });
    Readable.from(buffer)
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => resolve(uploadStream.id));
  });
}

export function openDownloadStream(fileId) {
  const bucket = getBucket();
  return bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
}

export async function deleteFile(fileId) {
  const bucket = getBucket();
  await bucket.delete(new mongoose.Types.ObjectId(fileId));
}