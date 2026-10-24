/** Offline nearest-neighbor preparation of the creator's pixel photograph.
 * Usage: node scripts/prepare-creator-art.mjs /absolute/path/to/node_modules/sharp
 * Source, permission and prompt: docs/art-creator-2026-10-24.md.
 */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;
await sharp(`${art}creator-robert-period-source.png`)
  .resize(100, 124, { kernel: 'nearest', fit: 'fill' })
  .png().toFile(`${art}creator-robert.png`);
