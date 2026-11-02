/** Contact sheets of real PL/EN budget captures, at native resolution.
 * Usage: node scripts/preview-budget-scenes.mjs /absolute/path/to/node_modules/sharp
 */
import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const root = new URL('../', import.meta.url);
const entries = JSON.parse(readFileSync(new URL('docs/art-prompts/budget-scenes-2026-11-02.json', root), 'utf8'));
const results = new URL('test-results/', root);
const captures = readdirSync(results, { recursive: true }).filter(path => path.endsWith('.png'));
for (const locale of ['pl', 'en']) {
  const tiles = await Promise.all(entries.map(async ({ name }, index) => {
    const filename = `budget-${name}-${locale}.png`;
    const capture = captures.find(path => path.endsWith(`/${filename}`));
    if (!capture) throw new Error(`Missing Playwright capture: ${filename}`);
    const input = await sharp(fileURLToPath(new URL(capture, results)))
      .resize(570, 320, { kernel: 'nearest', fit: 'fill' }).toBuffer();
    return { input, left: index % 2 * 570, top: Math.floor(index / 2) * 320 };
  }));
  await sharp({ create: { width: 1140, height: 640, channels: 3, background: '#171e18' } })
    .composite(tiles).png().toFile(fileURLToPath(new URL(`docs/budget-scenes-${locale}-2026-11-02.png`, root)));
}
