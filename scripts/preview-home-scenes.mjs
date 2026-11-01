/** Contact sheets of actual Playwright captures, at native resolution.
 * Usage: node scripts/preview-home-scenes.mjs /absolute/path/to/node_modules/sharp
 */
import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const root = new URL('../', import.meta.url);
const entries = JSON.parse(readFileSync(new URL('docs/art-prompts/home-scenes-2026-11-01.json', root), 'utf8'));
const results = new URL('test-results/', root);
const captures = readdirSync(results, { recursive: true }).filter(path => path.endsWith('.png'));
const scenes = [...entries,
  ...['weekend-radio', 'weekend-reading', 'weekend-soup', 'weekend-rain-tram'].map(name => ({ name, role: 'arrival' })),
  ...['weekend-budget', 'weekend-radio'].map(name => ({ name, role: 'budget' })),
];
for (const locale of ['pl', 'en']) {
  const tiles = await Promise.all(scenes.map(async ({ name, role }, index) => {
    const filename = `${role}-${name}-${locale}.png`;
    const capture = captures.find(path => path.endsWith(`/${filename}`));
    if (!capture) throw new Error(`Missing Playwright capture: ${filename}`);
    const input = await sharp(fileURLToPath(new URL(capture, results)))
      .resize(570, 320, { kernel: 'nearest', fit: 'fill' }).toBuffer();
    return { input, left: index % 2 * 570, top: Math.floor(index / 2) * 320 };
  }));
  await sharp({ create: { width: 1140, height: Math.ceil(scenes.length / 2) * 320, channels: 3, background: '#171e18' } })
    .composite(tiles).png().toFile(fileURLToPath(new URL(`docs/home-scenes-${locale}-2026-11-01.png`, root)));
}
