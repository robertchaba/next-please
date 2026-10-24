/** Prepare the separately generated workstation sprites without repainting them.
 * Usage: node scripts/prepare-workstation-sprites.mjs /absolute/path/to/node_modules/sharp
 * Alpha-bounds crop, aspect-preserving nearest-neighbor fit and a sampled clip-holder tilt.
 */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;
const sprites = { phone: [73, 51], scale: [43, 65], clips: [37, 36], clip: [10, 19] };

for (const [name, [width, height]] of Object.entries(sprites)) {
  const source = `${art}workstation-${name === 'phone' ? 'phone-olive' : name}-source.png`;
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    // Only ignore imperceptible alpha noise when finding the occupied bounds;
    // do not change the source's alpha inside those bounds.
    if (data[(y * info.width + x) * info.channels + 3] <= 8) continue;
    left = Math.min(left, x); top = Math.min(top, y);
    right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  if (right < left || bottom < top) throw new Error(`Empty transparent source: ${name}`);
  const crop = { left, top, width: right - left + 1, height: bottom - top + 1 };
  const prepared = sharp(source).extract(crop).resize(name === 'clips' ? 33 : width, name === 'clips' ? 30 : height, {
    fit: 'contain', position: 'centre', kernel: 'nearest', background: { r: 0, g: 0, b: 0, alpha: 0 },
  });
  if (name === 'clips') {
    // Rotate existing generated pixels six degrees clockwise, without antialiasing.
    const { data: pixels, info: size } = await prepared.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const tilted = Buffer.alloc(width * height * 4);
    const angle = 6 * Math.PI / 180, cos = Math.cos(angle), sin = Math.sin(angle);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const dx = x + 0.5 - width / 2, dy = y + 0.5 - height / 2;
      const sx = Math.floor(dx * cos + dy * sin + size.width / 2);
      const sy = Math.floor(-dx * sin + dy * cos + size.height / 2);
      if (sx < 0 || sy < 0 || sx >= size.width || sy >= size.height) continue;
      const from = (sy * size.width + sx) * 4;
      pixels.copy(tilted, (y * width + x) * 4, from, from + 4);
    }
    await sharp(tilted, { raw: { width, height, channels: 4 } }).png().toFile(`${art}sprites/workstation-${name}.png`);
  } else await prepared.png().toFile(`${art}sprites/workstation-${name}.png`);
  process.stdout.write(`${name}: ${info.width}x${info.height}, crop ${JSON.stringify(crop)}, fit ${width}x${height}\n`);
}
