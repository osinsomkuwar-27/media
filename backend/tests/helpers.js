import sharp from 'sharp';

// Generates a small valid JPEG in memory for upload tests, so tests
// don't depend on any fixture file existing on disk.
export async function createTestImageBuffer() {
  return sharp({
    create: { width: 200, height: 200, channels: 3, background: { r: 255, g: 0, b: 0 } },
  })
    .jpeg()
    .toBuffer();
}