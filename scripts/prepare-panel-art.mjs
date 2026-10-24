/** Offline nearest-neighbor preparation of the archive and staff-room scenes.
 * Usage: node scripts/prepare-panel-art.mjs /absolute/path/to/node_modules/sharp
 * Built-in image_gen sources and exact prompts: docs/art-panels-2026-10-24.md.
 */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;
for (const name of ['archives-clinic', 'break-room']) {
  await sharp(`${art}${name}-source.png`).resize(570, 320, { kernel: 'nearest', fit: 'fill' })
    .png().toFile(`${art}${name}.png`);
}
