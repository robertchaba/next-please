/** Offline preparation of generated stationery and the integrated desk front.
 * Usage: node scripts/prepare-stationery-art.mjs /absolute/path/to/node_modules/sharp
 * Crop transparent margins, then resize with nearest-neighbor sampling only.
 * Generated alpha inside each crop is preserved unchanged.
 */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;

for (const [name, width, height] of [['rack', 60, 65], ['edge', 360, 24], ['paper', 188, 144]]) {
  const source = `${art}workstation-${name}-source.png`;
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    // Imperceptible transparent noise does not enlarge the sprite's crop.
    if (data[(y * info.width + x) * info.channels + 3] <= 8) continue;
    left = Math.min(left, x); top = Math.min(top, y);
    right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  if (right < left || bottom < top) throw new Error(`Empty generated sprite: ${name}`);
  await sharp(source).extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .resize(width, height, { kernel: 'nearest', fit: 'fill' })
    .png().toFile(`${art}sprites/workstation-${name}.png`);
  console.log(`${name}: crop ${left},${top} ${right - left + 1}x${bottom - top + 1}; runtime ${width}x${height}`);
}
