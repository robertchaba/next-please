/** Offline preparation only. Generated alpha is retained; no drawing or matte removal.
 * node scripts/prepare-manual-v083-art.mjs /absolute/path/to/node_modules/sharp
 */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;

for (const [name, width, height] of [['cover', 138, 164], ['spread', 276, 164], ['corner', 9, 9]]) {
  const source = `${art}manual-${name}-v083-source.png`;
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] <= 8) continue;
    left = Math.min(left, x); top = Math.min(top, y);
    right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  if (right < left) throw new Error(`Empty generated manual asset: ${name}`);
  const target = name === 'corner' ? 'corner-right' : name;
  await sharp(source).extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .resize(width, height, { kernel: 'nearest', fit: 'fill' })
    .png().toFile(`${art}sprites/manual-${target}-v083.png`);
  console.log(`${name}: source ${info.width}x${info.height}; crop ${left},${top} ${right - left + 1}x${bottom - top + 1}; runtime ${width}x${height}`);
}
await sharp(`${art}sprites/manual-corner-right-v083.png`).flop().png().toFile(`${art}sprites/manual-corner-left-v083.png`);
