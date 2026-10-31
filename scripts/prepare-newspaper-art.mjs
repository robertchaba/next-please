/** Generated alpha is preserved. Offline: node scripts/prepare-newspaper-art.mjs /path/to/sharp */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;
for (const [name, revision, width, height] of [
  ['spread', 'spread-v2', 300, 180], ['folded', 'folded-v2', 88, 56],
  ['masthead-pl', 'masthead-pl', 268, 30], ['masthead-en', 'masthead-en', 216, 30],
]) {
  const source = `${art}newspaper-${revision}-source.png`;
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] <= 8) continue;
    left = Math.min(left, x); top = Math.min(top, y);
    right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  if (right < left) throw new Error(`Empty newspaper: ${name}`);
  const crop = { left, top, width: right - left + 1, height: bottom - top + 1 };
  await sharp(source).extract(crop).resize(width, height, { kernel: 'nearest', fit: 'fill' })
    .png().toFile(`${art}sprites/newspaper-${name}.png`);
  console.log(name, info.width, info.height, crop, width, height);
}
