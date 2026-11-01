/** Built-in image_gen sources, 2026-11-01. Offline Sharp, never a runtime dependency.
 * Usage: node scripts/prepare-endings-and-fine-art.mjs /absolute/path/to/node_modules/sharp
 * Full-composition nearest-neighbor resize; fine crops only transparent margins.
 */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;
await sharp(`${art}hospital-ending-source.png`).resize(570, 320, { fit: 'fill', kernel: 'nearest' })
  .png().toFile(`${art}hospital-ending.png`);
const source = `${art}inspection-fine-v2-source.png`;
const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let left = info.width, top = info.height, right = -1, bottom = -1;
for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
  if (data[(y * info.width + x) * info.channels + 3] <= 8) continue;
  left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
}
if (right < left) throw new Error('Empty fine source');
await sharp(source).extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
  .resize(200, 168, { fit: 'fill', kernel: 'nearest' }).png().toFile(`${art}sprites/inspection-fine.png`);
console.log(`Fine crop: ${left},${top} ${right-left+1}x${bottom-top+1}; runtime 200x168. Hospital: 570x320.`);
