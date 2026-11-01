/** Original built-in image_gen sources, 2026-10-27.
 * Usage: node scripts/prepare-inspection-art.mjs /absolute/path/to/node_modules/sharp
 * Only alpha-bounds cropping and nearest-neighbor resizing; no invented pixels.
 */
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;
const assets = [
  ...[1, 2, 3].map(id => [`zus-inspector-${id}`, `zus-inspector-${id}-source.png`, 94, 96]),
  ['inspector-id', 'inspector-id-v2-source.png', 188, 112],
  ['inspection-fine', 'inspection-fine-v2-source.png', 200, 168],
  ['archive-folder', 'archive-folder-source.png', 116, 72],
  ...Array.from({ length: 10 }, (_, i) => [`patient-${101+i}`, `patients-source/patient-${101+i}.png`, 94, 96]),
];
const portraits = [];
for (const [name, filename, width, height] of assets) {
  const source = art + filename;
  if (!existsSync(source)) { console.log(`${name}: pending source`); continue; }
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * info.channels + 3] <= 8) continue;
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  if (right < left) throw new Error(`Empty generated source: ${name}`);
  const output = `${art}sprites/${name}.png`;
  await sharp(source).extract({ left, top, width: right-left+1, height: bottom-top+1 })
    .resize(width, height, { fit: 'fill', kernel: 'nearest' }).png().toFile(output);
  if (height === 96) portraits.push({ name, output });
  console.log(`${name}: crop ${left},${top} ${right-left+1}x${bottom-top+1}; runtime ${width}x${height}`);
}
// Review-only contact sheet; colored review background is not loaded by the game.
const overlays = await Promise.all(portraits.map(async ({output}, i) => ({
  input: await sharp(output).resize(188, 192, { kernel: 'nearest' }).png().toBuffer(),
  left: (i % 5) * 200 + 6, top: Math.floor(i / 5) * 204 + 6,
})));
await sharp({create:{width:1000,height:612,channels:3,background:'#20271f'}})
  .composite(overlays).png().toFile(new URL('../docs/inspection-patients-roster-screen.png',import.meta.url).pathname);
