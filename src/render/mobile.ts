import { drawDocumentText, drawText, measureDocumentText, measureText } from './font';

/** The same original pixel lettering as the title screen, inside native DOM controls. */
export function drawMobileLabel(canvas: HTMLCanvasElement, value: string, scale: number, color = '#ddd6b5'): void {
  const lines = value.split('\n');
  canvas.width = measureText(value, scale);
  canvas.height = (9 + (lines.length - 1) * 12) * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  drawText(ctx, value, Math.floor(canvas.width / 2), 0, { scale, color, align: 'center' });
}

export function mobileStatusLines(value: string): string {
  const lines: string[] = [];
  for (const word of value.split(' ')) {
    const last = lines.at(-1);
    if (last !== undefined && measureText(`${last} ${word}`, 3) <= 276) lines[lines.length - 1] += ` ${word}`;
    else lines.push(word);
  }
  return lines.join('\n');
}

/** Upright native letters, enlarged by whole pixels on a steady baseline. */
function handwriting(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, scale: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  drawDocumentText(ctx, value, 0, 0, { color: '#354f62', face: 'handwritten' });
  ctx.restore();
}

export function drawMobileNote(canvas: HTMLCanvasElement, paper: HTMLImageElement | undefined, title: string, lines: readonly string[]): void {
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (paper) ctx.drawImage(paper, 0, 0);
  handwriting(ctx, title, 28, 20, 4);
  lines.forEach((line, index) => handwriting(ctx, line, 28, 64 + index * 24, 3));
}

export function mobileDialogueLines(value: string): string[] {
  const lines: string[] = [];
  for (const word of value.split(' ')) {
    const last = lines.at(-1);
    if (last !== undefined && measureDocumentText(`${last} ${word}`) <= 108) lines[lines.length - 1] += ` ${word}`;
    else lines.push(word);
  }
  return lines;
}

export function drawMobileDialogue(canvas: HTMLCanvasElement, balloon: HTMLImageElement | undefined, value: string): void {
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (balloon) ctx.drawImage(balloon, 0, 0);
  const lines = mobileDialogueLines(value);
  ctx.save();
  ctx.scale(2, 2);
  drawDocumentText(ctx, lines.join('\n'), 65, 20 + Math.round((40 - lines.length * 8) / 2), { color: '#232a23', align: 'center' });
  ctx.restore();
}
