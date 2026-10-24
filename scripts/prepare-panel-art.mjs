/** Offline nearest-neighbor preparation of the archive and staff-room scenes.
 * Usage: node scripts/prepare-panel-art.mjs /absolute/path/to/node_modules/sharp
 * Built-in image_gen sources and exact prompts: docs/art-panels-2026-10-24.md
 * and docs/art-nurse-revision-2026-10-24.md.
 */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;
// Composite only the generated expression correction. Every other source pixel
// stays from the approved archive, avoiding unrelated changes from generation.
const face = { left: 1254, top: 333, width: 108, height: 102 };
const neutralFace = await sharp(`${art}archives-clinic-neutral-source.png`)
  .extract(face).png().toBuffer();
const archive = await sharp(`${art}archives-clinic-source.png`)
  .composite([{ input: neutralFace, left: face.left, top: face.top }])
  .png().toBuffer();
await sharp(archive)
  .resize(570, 320, { kernel: 'nearest', fit: 'fill' })
  .png().toFile(`${art}archives-clinic.png`);
await sharp(`${art}break-room-source.png`)
  .resize(570, 320, { kernel: 'nearest', fit: 'fill' })
  .png().toFile(`${art}break-room.png`);
