/** Offline preparation of the dark patient alcove, pendant lamp and desk bell.
 * Usage: node scripts/prepare-corridor-art.mjs /absolute/path/to/node_modules/sharp
 * Only crop, composite and nearest-neighbor resize; generated source alpha stays intact.
 */
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const art = new URL('../public/assets/art/', import.meta.url).pathname;
const resize = { kernel: 'nearest', fit: 'fill' };
const piece = async (file, left, top, width, height, w, h, x, y) => ({
  input: await sharp(`${art}${file}.png`).extract({ left, top, width, height }).resize(w, h, resize).png().toBuffer(),
  left: x, top: y,
});
// The edited background uses the final layout. Keep the approved desktop
// surfaces and joinery, adding only its generated bell above the closed book.
const revised = await sharp(`${art}cabinet-shadow-source.png`).resize(570, 320, resize).png().toBuffer();
const revisedPiece = async (left, top, width, height, x = left, y = top) => ({
  input: await sharp(revised).extract({ left, top, width, height }).png().toBuffer(), left: x, top: y,
});
// The bell is an alpha cutout. An opaque crop would carry the old green
// blotter along with it and cover the wood at its new position.
const bell = await sharp(`${art}bell-transparent-source.png`).resize(44, 40, resize).png().toBuffer();
await sharp(bell).toFile(`${art}sprites/bell.png`);
const pieces = await Promise.all([
  revisedPiece(0, 0, 204, 128),
  revisedPiece(210, 0, 360, 128),
  piece('cabinet-clinic', 0, 128, 282, 192, 204, 192, 0, 128),
  piece('cabinet-clinic', 288, 128, 282, 192, 360, 192, 210, 128),
  piece('cabinet-clinic', 282, 0, 6, 320, 6, 320, 204, 0),
  { input: bell, left: 150, top: 145 },
]);
await sharp({ create: { width: 570, height: 320, channels: 3, background: '#171e18' } })
  .composite(pieces).png().toFile(`${art}cabinet-corridor.png`);

await import('./prepare-stamp-art.mjs');

// Keep the original wooden introduction source archived, but prepare the
// current matching mechanical illustration after the original resize recipe.
await sharp(`${art}intro-stamp-mechanical-source.png`).resize(570, 320, resize)
  .png().toFile(`${art}intro-stamp.png`);
