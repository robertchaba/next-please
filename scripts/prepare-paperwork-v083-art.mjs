/** Original built-in imagegen sources; crop alpha margins, nearest-neighbor only.
 * node scripts/prepare-paperwork-v083-art.mjs /absolute/path/to/node_modules/sharp
 * Retain generated alpha; do not paint or synthesize replacement graphics.
 */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;
for (const name of ['referral', 'militia', 'lot', 'certificate', 'clinical', 'envelope', 'seal-militia', 'seal-lot']) {
  const source = `${art}paperwork-v083/${name}-source.png`;
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * info.channels + 3] <= 8) continue;
    left = Math.min(left, x); top = Math.min(top, y);
    right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  if (right < left) throw new Error(`Empty sprite: ${name}`);
  const seal = name.startsWith('seal-');
  const width = name === 'seal-lot' ? 64 : seal ? 44 : 188, height = seal ? 44 : 144;
  await sharp(source).extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .resize(width, height, { kernel: 'nearest', fit: 'fill' }).png()
    .toFile(`${art}sprites/${seal ? '' : 'paper-'}${name}-v083.png`);
  console.log(`${name}: ${left},${top} ${right-left+1}x${bottom-top+1} -> ${width}x${height}`);
}
