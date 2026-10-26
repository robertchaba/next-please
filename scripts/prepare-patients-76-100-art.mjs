/** Offline preparation of original built-in image_gen artwork, IDs 76–100.
 * Usage: node scripts/prepare-patients-76-100-art.mjs /absolute/path/to/node_modules/sharp
 * Crops transparent margins and resizes nearest-neighbor; never invents artwork.
 * Missing sources are reported so this can also prepare completed generation batches.
 */
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;
const firstId = 76;
const contactSheet = [];
for (let id = firstId; id < firstId + 25; id++) {
  const name = `patient-${id}`;
  const source = `${art}patients-source/${name}.png`;
  if (!existsSync(source)) { console.log(`${name}: source pending`); continue; }
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x1 = info.width, y1 = info.height, x2 = -1, y2 = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] <= 8) continue;
    x1 = Math.min(x1, x); y1 = Math.min(y1, y); x2 = Math.max(x2, x); y2 = Math.max(y2, y);
  }
  if (x2 < x1) throw new Error(`Empty artwork: ${name}`);
  await sharp(source).extract({ left: x1, top: y1, width: x2-x1+1, height: y2-y1+1 })
    .resize(94, 96, { kernel: 'nearest', fit: 'fill' }).png().toFile(`${art}sprites/${name}.png`);
  contactSheet.push({
    input: await sharp(`${art}sprites/${name}.png`).resize(188, 192, { kernel: 'nearest' }).png().toBuffer(),
    left: ((id - firstId) % 5) * 200 + 6,
    top: Math.floor((id - firstId) / 5) * 204 + 6,
  });
  console.log(`${name}: ${x2-x1+1}x${y2-y1+1} -> 94x96`);
}
// Neutral review surface only; never loaded by the game.
await sharp({ create: { width: 1000, height: 1020, channels: 3, background: '#20271f' } })
  .composite(contactSheet).png().toFile(new URL('../docs/patients-76-100-roster-screen.png', import.meta.url).pathname);
