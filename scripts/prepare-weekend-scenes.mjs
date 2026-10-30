/** Offline full-composition nearest-neighbor resize. Requires ImageMagick convert.
 * Usage: node scripts/prepare-weekend-scenes.mjs
 * No illustrated pixels are drawn, retouched, recolored or replaced.
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const entries = JSON.parse(readFileSync(new URL('docs/art-prompts/weekend-seasonal-2026-10-30.json', root), 'utf8'));
for (const { name } of entries.filter(entry => entry.active !== false)) {
  const source = fileURLToPath(new URL(`public/assets/art/weekend-seasonal-source/${name}.png`, root));
  const output = fileURLToPath(new URL(`public/assets/art/${name}.png`, root));
  execFileSync('convert', [source, '-filter', 'point', '-resize', '570x320!', '-strip', output]);
  console.log(`${name}: 570 × 320`);
}
