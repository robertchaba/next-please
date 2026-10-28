/** Offline crop/nearest-neighbor preparation of built-in imagegen ink impressions.
 * node scripts/prepare-stamps-revision-art.mjs /absolute/path/to/node_modules/sharp
 * Alpha > 8 locates bounds; generated alpha remains unmodified in the crop.
 */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/stamps-revision/', import.meta.url).pathname;
for (const [name, width, height] of [['employer', 62, 24], ['militia', 50, 30], ['lot', 62, 24]]) {
  const source = `${art}${name}-source.png`;
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * info.channels + 3] <= 8) continue;
    left = Math.min(left, x); top = Math.min(top, y);
    right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  if (right < left) throw new Error(`Empty generated ink: ${name}`);
  await sharp(source).extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .resize(width, height, { kernel: 'nearest', fit: 'fill' }).png().toFile(`${art}${name}.png`);
  console.log(`${name}: source ${info.width}x${info.height}; crop ${left},${top},${right-left+1},${bottom-top+1}; native ${width}x${height}`);
}
