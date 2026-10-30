/** Assemble actual Playwright captures at native size; no illustrated content is added.
 * Run after tests/browser/weekend-scenes.spec.ts.
 */
import { readFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const entries = JSON.parse(readFileSync(join(root, 'docs/art-prompts/weekend-seasonal-2026-10-30.json'), 'utf8'));
const captures = readdirSync(join(root, 'test-results'), { recursive: true }).filter(path => path.endsWith('.png'));
const temporary = mkdtempSync(join(tmpdir(), 'next-please-weekend-preview-'));
try {
  for (const locale of ['pl', 'en']) {
    const tiles = entries.filter(entry => entry.active !== false).map(({ name }) => {
      const filename = `${name}-${locale}.png`;
      const capture = captures.find(path => path.endsWith(`/${filename}`));
      if (!capture) throw new Error(`Missing Playwright capture: ${filename}`);
      const tile = join(temporary, filename);
      execFileSync('convert', [join(root, 'test-results', capture), '-filter', 'point', '-resize', '570x320!', tile]);
      return tile;
    });
    execFileSync('montage', [...tiles, '-tile', '2x', '-geometry', '570x320+0+0', '-background', '#171e18', '-strip',
      join(root, `docs/weekend-scenes-${locale}-2026-10-30.png`)]);
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
