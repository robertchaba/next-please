/** Offline preparation of generated day-seven document rack, preserving alpha.
 * Usage: node scripts/prepare-referral-rack-art.mjs /absolute/path/to/node_modules/sharp
 */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;
const source = `${art}workstation-rack-referrals-source.png`;
const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let left = info.width, top = info.height, right = -1, bottom = -1;
for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
  if (data[(y * info.width + x) * 4 + 3] <= 8) continue;
  left = Math.min(left, x); top = Math.min(top, y);
  right = Math.max(right, x); bottom = Math.max(bottom, y);
}
if (right < left) throw new Error('Empty rack source');
await sharp(source).extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
  .resize(60, 65, { kernel: 'nearest', fit: 'fill' }).png().toFile(`${art}sprites/workstation-rack-referrals.png`);
console.log(`rack: crop ${left},${top} ${right-left+1}x${bottom-top+1} -> 60x65`);
