/** Offline preparation of the compact mechanical stamp pair.
 * Usage: node scripts/prepare-stamp-art.mjs /absolute/path/to/node_modules/sharp
 * Crop and nearest-neighbor resize only; retain the generated alpha channel.
 */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;
const file = `${art}mechanical-stamps-compact-source.png`;
const { width, height } = await sharp(file).metadata();
const cellWidth = Math.floor(width / 2);

for (const [index, name] of ['stamp-fit', 'stamp-unfit'].entries()) {
  const source = await sharp(file)
    .extract({ left: index * cellWidth, top: 0, width: cellWidth, height }).png().toBuffer();
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x1 = cellWidth, y1 = height, x2 = 0, y2 = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < cellWidth; x++) {
    // Ignore imperceptible surrounding noise only when locating the subject.
    if (data[(y * cellWidth + x) * info.channels + 3] <= 8) continue;
    x1 = Math.min(x1, x); y1 = Math.min(y1, y);
    x2 = Math.max(x2, x); y2 = Math.max(y2, y);
  }
  await sharp(source).extract({ left: x1, top: y1, width: x2 - x1 + 1, height: y2 - y1 + 1 })
    .resize(48, 48, { kernel: 'nearest', fit: 'fill' }).png().toFile(`${art}sprites/${name}.png`);
}
