/** Offline asset preparation only; Sharp is not a game dependency.
 * Usage: node scripts/prepare-clinic-art.mjs /absolute/path/to/node_modules/sharp
 * Sources are generated PNGs, preserved unmodified beside the runtime copies.
 */
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;
const resize = { kernel: 'nearest', fit: 'fill' };

for (const name of ['scalpel', 'catheter', 'pen', 'stamp']) {
  await sharp(`${art}intro-${name}-source.png`).resize(570, 320, resize).png().toFile(`${art}intro-${name}.png`);
}

// Fit the generated four areas to the established logical desktop layout.
const room = `${art}cabinet-clinic-source.png`;
const piece = async (left, top, width, height, w, h, x, y) => ({
  input: await sharp(room).extract({ left, top, width, height }).resize(w, h, resize).png().toBuffer(), left: x, top: y,
});
const pieces = await Promise.all([
  piece(0, 0, 823, 477, 282, 128, 0, 0),
  piece(853, 0, 819, 477, 282, 128, 288, 0),
  piece(0, 508, 823, 433, 282, 182, 0, 138),
  piece(853, 508, 819, 433, 282, 182, 288, 138),
  piece(0, 478, 1672, 30, 570, 10, 0, 128),
  piece(824, 0, 28, 941, 6, 320, 282, 0),
]);
await sharp({ create: { width: 570, height: 320, channels: 3, background: '#171e18' } })
  .composite(pieces).png().toFile(`${art}cabinet-clinic.png`);

await mkdir(`${art}sprites`, { recursive: true });
// The model's cells have unequal margins. Crop each complete subject, then
// trim transparent margins. Keep original alpha; do not recolor the artwork.
const sprites = [
  ['stamp-fit', 0, 0, 360, 350, 48, 48], ['stamp-unfit', 360, 0, 370, 350, 48, 48],
  ['manual', 730, 0, 370, 350, 100, 42], ['cup', 1100, 0, 348, 350, 34, 38],
  ['pencil', 0, 350, 360, 340, 12, 66], ['plant', 360, 350, 370, 340, 45, 42],
  ['certificate', 730, 350, 370, 340, 36, 40], ['clock', 1100, 350, 348, 340, 38, 38],
  ['patient-0', 0, 690, 360, 396, 94, 96], ['patient-1', 360, 690, 370, 396, 94, 96],
  ['patient-2', 730, 690, 360, 396, 94, 96], ['paper', 1090, 690, 358, 396, 188, 144],
];
for (const [name, left, top, width, height, w, h] of sprites) {
  const cropped = await sharp(`${art}clinic-sprites-source.png`).extract({ left, top, width, height }).png().toBuffer();
  // Near-invisible alpha noise surrounds the generated subjects. Find their
  // visible bounds without thresholding or replacing the alpha inside them.
  const { data, info } = await sharp(cropped).raw().toBuffer({ resolveWithObject: true });
  let x1 = width, y1 = height, x2 = 0, y2 = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * info.channels + 3] <= 8) continue;
    x1 = Math.min(x1, x); y1 = Math.min(y1, y);
    x2 = Math.max(x2, x); y2 = Math.max(y2, y);
  }
  const trimmed = await sharp(cropped).extract({ left: x1, top: y1, width: x2 - x1 + 1, height: y2 - y1 + 1 }).png().toBuffer();
  await sharp(trimmed).resize(w, h, resize).png().toFile(`${art}sprites/${name}.png`);
}
