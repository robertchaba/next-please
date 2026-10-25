/** Offline preparation of the generated drawer, calendar, seals and signatures.
 * Usage: node scripts/prepare-drawer-documents-art.mjs /absolute/path/to/node_modules/sharp
 * Crop transparent margins and resize with nearest-neighbor only; retain generated alpha.
 */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;

await sharp(`${art}drawer-interior-source.png`)
  .resize(570, 320, { kernel: 'nearest', fit: 'fill' }).png().toFile(`${art}drawer-interior.png`);

for (const [name, width, height, sourceName = name] of [
  ['workstation-calendar', 48, 40, 'workstation-calendar-muted'],
  ['imprint-fit-pl', 116, 32], ['imprint-unfit-pl', 116, 32, 'imprint-refusal-pl'],
  ['imprint-fit-en', 116, 32], ['imprint-unfit-en', 116, 32, 'imprint-refusal-en'],
  ['document-seal', 24, 24], ['document-signature', 46, 12],
  ['document-seal-zus', 36, 24], ['document-seal-employer', 24, 24],
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

