/** Localized generated cabinet edits; all other approved background pixels stay intact.
 * Usage: node scripts/prepare-workstation-polish.mjs /absolute/path/to/node_modules/sharp
 * Run prepare-corridor-art.mjs first when rebuilding the original cabinet as well.
 */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;
const revised = await sharp(`${art}cabinet-workstation-source.png`)
  .resize(570, 320, { kernel: 'nearest', fit: 'fill' }).png().toBuffer();
// The complete chart includes generated paper, rails and printed optotypes.
// Resize before extraction so its location follows the original logical canvas.
const eyeChartScene = await sharp(`${art}cabinet-eye-chart-source.png`)
  .resize(570, 320, { kernel: 'nearest', fit: 'fill' }).png().toBuffer();
const eyeChart = await sharp(eyeChartScene)
  .extract({ left: 244, top: 15, width: 77, height: 62 }).png().toBuffer();
const region = async (left, top, width, height, x, y, targetHeight = height) => ({
  input: await sharp(revised).extract({ left, top, width, height })
    .resize(width, targetHeight, { kernel: 'nearest', fit: 'fill' }).png().toBuffer(),
  left: x, top: y,
});
await sharp(`${art}cabinet-corridor.png`).composite(await Promise.all([
  { input: eyeChart, left: 244, top: 15 },
  // The scale is part of the wall illustration and shares the room's lamp shading.
  // Stop before the generated desk trim: it sits above the approved divider.
  // Keep the platform's last dark row without importing the surrounding trim.
  region(399, 61, 48, 64, 399, 61),
  region(410, 125, 26, 1, 410, 125),
  // Both desks share one height and finish; retain the original central divider.
  region(0, 289, 204, 31, 0, 296, 24),
  region(210, 289, 360, 31, 210, 296, 24),
])).png().toFile(`${art}cabinet-workstation.png`);
