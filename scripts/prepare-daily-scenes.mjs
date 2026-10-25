/** Offline preparation; no generated pixels are replaced or drawn in code.
 * Usage: node scripts/prepare-daily-scenes.mjs /absolute/path/to/node_modules/sharp
 */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;
for (const name of ['homecoming', 'going-to-work', 'weekend-budget', 'mountain-resort', 'seaside-resort']) {
  await sharp(`${art}daily-scenes-source/${name}.png`)
    .resize(570, 320, { kernel: 'nearest', fit: 'fill' }).png().toFile(`${art}${name}.png`);
  console.log(`${name}: 570 × 320`);
}
