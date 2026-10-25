/** Offline preparation of the generated localized refusal impressions.
 * Usage: node scripts/prepare-refusal-art.mjs /absolute/path/to/node_modules/sharp
 * Crop transparent margins and resize with nearest-neighbor only; retain generated alpha.
 */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;

for (const [name, width, height, sourceName] of [
  ['imprint-unfit-pl', 116, 32, 'imprint-refusal-pl'],
  ['imprint-unfit-en', 116, 32, 'imprint-refusal-en'],
]) {
  const source = `${art}${sourceName}-source.png`;
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    // Only ignore nearly invisible alpha while locating crop bounds.
    if (data[(y * info.width + x) * info.channels + 3] <= 8) continue;
    left = Math.min(left, x); top = Math.min(top, y);
    right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  if (right < left || bottom < top) throw new Error(`Empty generated sprite: ${name}`);
  await sharp(source).extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .resize(width, height, { kernel: 'nearest', fit: 'fill' })
    .png().toFile(`${art}sprites/${name}.png`);
  console.log(`${name}: crop ${left},${top} ${right - left + 1}x${bottom - top + 1}; runtime ${width}x${height}`);
}

