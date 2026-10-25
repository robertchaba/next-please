/** Offline preparation of original built-in image_gen artwork.
 * Usage: node scripts/prepare-economy-art.mjs /absolute/path/to/node_modules/sharp
 * Only crops transparent margins and uses nearest-neighbor resizing; no drawn art.
 */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;
const contactSheet = [];
for (let id = 1; id <= 25; id++) {
  const name = `patient-${String(id).padStart(2, '0')}`;
  const source = `${art}patients-source/${name}.png`;
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x1 = info.width, y1 = info.height, x2 = -1, y2 = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] <= 8) continue;
    x1 = Math.min(x1, x); y1 = Math.min(y1, y); x2 = Math.max(x2, x); y2 = Math.max(y2, y);
  }
  if (x2 < x1) throw new Error(`Empty artwork: ${name}`);
  await sharp(source).extract({ left:x1, top:y1, width:x2-x1+1, height:y2-y1+1 })
    .resize(94, 96, { kernel: 'nearest', fit: 'fill' }).png().toFile(`${art}sprites/${name}.png`);
  contactSheet.push({
    input: await sharp(`${art}sprites/${name}.png`).resize(188, 192, { kernel: 'nearest' }).png().toBuffer(),
    left: ((id - 1) % 5) * 200 + 6,
    top: Math.floor((id - 1) / 5) * 204 + 6,
  });
  console.log(`${name}: ${x2-x1+1}x${y2-y1+1} -> 94x96`);
}
await sharp(`${art}home-evening-source.png`).resize(570, 320, { kernel: 'nearest', fit: 'fill' })
  .png().toFile(`${art}home-evening.png`);
// Review artifact only: the background is a neutral transparency-preview surface.
await sharp({ create: { width: 1000, height: 1020, channels: 3, background: '#20271f' } })
  .composite(contactSheet).png().toFile(new URL('../docs/patients-roster-screen.png', import.meta.url).pathname);
