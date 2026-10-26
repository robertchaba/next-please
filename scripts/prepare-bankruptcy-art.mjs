/** Offline preparation of generated pixels; no drawing or retouching.
 * node scripts/prepare-bankruptcy-art.mjs /absolute/path/to/node_modules/sharp
 */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;
await sharp(`${art}daily-scenes-source/bankruptcy-cloakroom.png`)
  .resize(570, 320, { kernel: 'nearest', fit: 'fill' }).png().toFile(`${art}bankruptcy-cloakroom.png`);
