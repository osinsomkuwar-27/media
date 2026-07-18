import sharp from 'sharp';

// Preview: downsized + heavily compressed JPEG. Deliberately lossy
// enough that it's not a usable substitute for the original.
export async function generatePreview(buffer) {
  return sharp(buffer)
    .resize({ width: 600, withoutEnlargement: true })
    .jpeg({ quality: 40 })
    .toBuffer();
}