/** Prepare the 1.0.8 cast audit from retained built-in image_gen sources.
 * node scripts/prepare-patient-audit-art.mjs /absolute/path/to/node_modules/sharp
 * Only transparent-margin cropping and nearest-neighbor resizing; no repainting.
 */
import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(readFileSync(`${root}docs/art-prompts/patients-v108.json`, 'utf8'));
const portraits = [...manifest.portraits].sort((a, b) => a.id - b.id);
const overlays = [];
let totalBytes = 0;
for (const [index, portrait] of portraits.entries()) {
  const source = readFileSync(`${root}${portrait.destination}`);
  if (createHash('sha256').update(source).digest('hex') !== portrait.sourceSha256) {
    throw new Error(`patient-${portrait.id}: source differs from the reviewed generator output`);
  }
  if (!(await sharp(source).metadata()).hasAlpha) throw new Error(`patient-${portrait.id}: missing source alpha`);
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] <= 8) continue;
    left = Math.min(left, x); top = Math.min(top, y);
    right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  if (right < left || left === 0 || top === 0 || right === info.width - 1 || bottom === info.height - 1) {
    throw new Error(`patient-${portrait.id}: empty or clipped silhouette`);
  }
  const sprite = await sharp(source).extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .resize(94, 96, { fit: 'fill', kernel: 'nearest' }).png().toBuffer();
  const pixels = await sharp(sprite).raw().toBuffer();
  if (pixels[3] !== 0 || pixels[93 * 4 + 3] !== 0) {
    throw new Error(`patient-${portrait.id}: opaque upper corners`);
  }
  await sharp(sprite).toFile(`${root}public/assets/art/sprites/patient-${String(portrait.id).padStart(2, '0')}.png`);
  overlays.push({ input: await sharp(sprite).resize(188, 192, { kernel: 'nearest' }).png().toBuffer(),
    left: (index % 5) * 200 + 6, top: Math.floor(index / 5) * 204 + 6 });
  totalBytes += sprite.length;
}
// A neutral review surface only; the game never loads this contact sheet.
await sharp({ create: { width: 1000, height: Math.ceil(portraits.length / 5) * 204, channels: 3, background: '#20271f' } })
  .composite(overlays).png().toFile(`${root}docs/patients-audit-roster-screen.png`);

const hashes = new Map();
for (const file of readdirSync(`${root}public/assets/art/sprites`).filter(file => /^patient-\d+\.png$/.test(file))) {
  const source = sharp(`${root}public/assets/art/sprites/${file}`);
  const { width, height, hasAlpha } = await source.metadata();
  if (width !== 94 || height !== 96 || !hasAlpha) throw new Error(`${file}: invalid runtime footprint`);
  const hash = createHash('sha256').update(await source.ensureAlpha().raw().toBuffer()).digest('hex');
  if (hashes.has(hash)) throw new Error(`${file} duplicates ${hashes.get(hash)}`);
  hashes.set(hash, file);
}
console.log(`Prepared ${portraits.length} revised portraits (${totalBytes} bytes); all ${hashes.size} ordinary faces have unique pixels.`);
