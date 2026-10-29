/** Prepare original built-in image_gen portraits, 2026-10-29.
 * Usage: node scripts/prepare-patients-136-185-art.mjs /absolute/path/to/node_modules/sharp
 * Optional --allow-missing prepares finished sources during generation.
 * Only crop transparent margins and resize nearest-neighbor; retain source alpha.
 */
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const allowMissing = process.argv.includes('--allow-missing');
const art = fileURLToPath(new URL('../public/assets/art/', import.meta.url));
const portraits = Array.from({ length: 50 }, (_, index) => ({
  id: 136 + index,
  source: `${art}patients-source/patient-${136 + index}.png`,
  output: `${art}sprites/patient-${136 + index}.png`,
}));
const missing = portraits.filter(({ source }) => !existsSync(source));
if (missing.length && !allowMissing) {
  throw new Error(`Missing generated sources: ${missing.map(({ id }) => id).join(', ')}`);
}
const overlays = [];
const hashes = new Set();
let totalBytes = 0;
for (const [index, { id, source, output }] of portraits.entries()) {
  if (!existsSync(source)) continue;
  if (!(await sharp(source).metadata()).hasAlpha) throw new Error(`patient-${id}: source has no alpha`);
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] <= 8) continue;
    left = Math.min(left, x); top = Math.min(top, y);
    right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  if (right < left) throw new Error(`patient-${id}: empty generated source`);
  if (left === 0 || top === 0 || right === info.width - 1 || bottom === info.height - 1) {
    throw new Error(`patient-${id}: silhouette touches the source boundary; review the complete portrait`);
  }
  const width = right - left + 1, height = bottom - top + 1;
  const sprite = await sharp(source).extract({ left, top, width, height })
    .resize(94, 96, { fit: 'fill', kernel: 'nearest' }).png().toBuffer();
  const pixels = await sharp(sprite).raw().toBuffer();
  if (pixels[3] !== 0 || pixels[93 * 4 + 3] !== 0) {
    throw new Error(`patient-${id}: upper corners must remain transparent`);
  }
  const hash = createHash('sha256').update(pixels).digest('hex');
  if (hashes.has(hash)) throw new Error(`patient-${id}: duplicate portrait pixels`);
  hashes.add(hash);
  await sharp(sprite).toFile(output);
  totalBytes += sprite.length;
  overlays.push({
    input: await sharp(sprite).resize(188, 192, { kernel: 'nearest' }).png().toBuffer(),
    left: (index % 5) * 200 + 6, top: Math.floor(index / 5) * 204 + 6,
  });
  console.log(`patient-${id}: crop ${left},${top} ${width}x${height} -> 94x96`);
}
// Review surface only: the game never loads this contact sheet.
await sharp({ create: { width: 1000, height: 2040, channels: 3, background: '#20271f' } })
  .composite(overlays).png().toFile(fileURLToPath(new URL('../docs/patients-136-185-roster-screen.png', import.meta.url)));
console.log(`${hashes.size}/50 unique portraits prepared; ${totalBytes} runtime PNG bytes.`);
