/** Offline full-composition nearest-neighbor preparation of generated artwork.
 * Usage: node scripts/prepare-home-scenes.mjs /absolute/path/to/node_modules/sharp
 * No cropping, recoloring, retouching or drawn replacement objects.
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const root = new URL('../', import.meta.url);
const entries = JSON.parse(readFileSync(new URL('docs/art-prompts/home-scenes-2026-11-01.json', root), 'utf8'));
for (const { name } of entries) {
  const source = fileURLToPath(new URL(`public/assets/art/home-scenes-source/${name}.png`, root));
  const output = fileURLToPath(new URL(`public/assets/art/${name}.png`, root));
  await sharp(source).resize(570, 320, { kernel: 'nearest', fit: 'fill' }).png().toFile(output);
  console.log(`${name}: 570 × 320`);
}
