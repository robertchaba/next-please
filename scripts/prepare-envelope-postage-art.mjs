/** Built-in imagegen edit; crop transparent margins and retain generated alpha.
 * node scripts/prepare-envelope-postage-art.mjs /absolute/path/to/node_modules/sharp
 * No painting, texture synthesis or window masking is performed here.
 */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;
const source = `${art}envelope-revision/postage-source.png`;
const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let left = info.width, top = info.height, right = -1, bottom = -1;
for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
  if (data[(y * info.width + x) * info.channels + 3] <= 8) continue;
  left = Math.min(left, x); top = Math.min(top, y);
  right = Math.max(right, x); bottom = Math.max(bottom, y);
}
if (right < left) throw new Error('Empty envelope sprite');
const crop = { left, top, width: right - left + 1, height: bottom - top + 1 };
await sharp(source).extract(crop)
  .resize(188, 144, { kernel: 'nearest', fit: 'fill' }).png()
  .toFile(`${art}sprites/paper-envelope-postage.png`);
console.log(`envelope: ${info.width}x${info.height}; crop ${JSON.stringify(crop)} -> 188x144`);
