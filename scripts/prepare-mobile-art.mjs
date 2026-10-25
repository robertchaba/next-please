/** Offline only: node scripts/prepare-mobile-art.mjs /path/to/node_modules/sharp */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;

await sharp(`${art}mobile-handset-source.png`).resize(320, 480, { kernel: 'nearest', fit: 'fill' })
  .png().toFile(`${art}mobile-handset.png`);
for (const [name, width, height] of [['note', 280, 260], ['balloon', 260, 118]]) {
  const source = `${art}mobile-${name === 'note' ? 'note-loose' : name}-source.png`;
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * info.channels + 3] <= 8) continue;
    left = Math.min(left, x); top = Math.min(top, y);
    right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  if (right < left) throw new Error(`Empty sprite: ${name}`);
  await sharp(source).extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .resize(width, height, { kernel: 'nearest', fit: 'fill' }).png().toFile(`${art}mobile-${name}.png`);
  console.log(`${name}: crop ${left},${top} ${right - left + 1}x${bottom - top + 1}; ${width}x${height}`);
}

// Crop both sound states to the same bounds so their speaker never shifts.
let iconLeft = Infinity, iconTop = Infinity, iconRight = -1, iconBottom = -1;
for (const state of ['on', 'off']) {
  const { data, info } = await sharp(`${art}mobile-sound-${state}-source.png`)
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * info.channels + 3] <= 8) continue;
    iconLeft = Math.min(iconLeft, x); iconTop = Math.min(iconTop, y);
    iconRight = Math.max(iconRight, x); iconBottom = Math.max(iconBottom, y);
  }
}
if (iconRight < iconLeft) throw new Error('Empty sound icons');
const iconCrop = { left: iconLeft, top: iconTop, width: iconRight - iconLeft + 1, height: iconBottom - iconTop + 1 };
for (const state of ['on', 'off']) {
  await sharp(`${art}mobile-sound-${state}-source.png`).extract(iconCrop)
    .resize(18, 18, { kernel: 'nearest', fit: 'contain', background: '#00000000' })
    .png().toFile(`${art}mobile-sound-${state}.png`);
}
console.log(`sound icons: shared crop ${iconLeft},${iconTop} ${iconCrop.width}x${iconCrop.height}; 18x18`);
