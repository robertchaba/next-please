/** Prepare the generated SIO companion of the original ZUS stamp.
 * Usage: node scripts/prepare-localized-seal.mjs /absolute/path/to/node_modules/sharp
 * Locate visible alpha, crop transparent margins, resize with nearest-neighbor.
 * Preserve the generated ink and alpha; never draw or replace lettering here.
 */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;
const source = `${art}document-seal-sio-source.png`;
const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let left = info.width, top = info.height, right = -1, bottom = -1;
for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
  if (data[(y * info.width + x) * info.channels + 3] <= 8) continue;
  left = Math.min(left, x); top = Math.min(top, y);
  right = Math.max(right, x); bottom = Math.max(bottom, y);
}
if (right < left) throw new Error('Empty generated SIO seal');
const crop = { left, top, width: right - left + 1, height: bottom - top + 1 };
await sharp(source).extract(crop).resize(36, 24, { kernel: 'nearest', fit: 'fill' })
  .png().toFile(`${art}sprites/document-seal-sio.png`);
console.log({ source: { width: info.width, height: info.height }, crop, output: { width: 36, height: 24 } });
