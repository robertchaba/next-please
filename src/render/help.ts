import { translations, type Locale } from '../i18n';
import { drawText, measureText } from './font';

export const HELP_PANEL = { x: 56, y: 20, w: 458, h: 280 } as const;
export const HELP_VIEW = { x: 78, y: 78, w: 414, h: 170 } as const;
export const HELP_TEXT_WIDTH = HELP_VIEW.w - 20;
const LINE_HEIGHT = 14;

type HelpBlock = { text: string; heading: boolean; lines: string[]; y: number; height: number };

/** Shared paragraph geometry keeps canvas text and the native scroll region aligned. */
export function helpLayout(locale: Locale): { blocks: HelpBlock[]; height: number } {
  const copy = translations[locale].help;
  const paragraphs = [{ text: copy.intro, heading: false }, ...copy.sections.flatMap(section => [
    { text: section.title, heading: true }, { text: section.body, heading: false },
  ])];
  let y = 0;
  const blocks = paragraphs.map(paragraph => {
    const lines: string[] = [];
    let line = '';
    for (const word of paragraph.text.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && measureText(candidate) > HELP_TEXT_WIDTH) { lines.push(line); line = word; }
      else line = candidate;
    }
    if (line) lines.push(line);
    const height = lines.length * LINE_HEIGHT + (paragraph.heading ? 2 : 12);
    const block = { ...paragraph, lines, y, height };
    y += height;
    return block;
  });
  return { blocks, height: y };
}

export function drawHelpText(ctx: CanvasRenderingContext2D, locale: Locale, scrollTop: number): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(HELP_VIEW.x, HELP_VIEW.y, HELP_TEXT_WIDTH, HELP_VIEW.h);
  ctx.clip();
  for (const block of helpLayout(locale).blocks) {
    block.lines.forEach((line, index) => {
      drawText(ctx, line, HELP_VIEW.x, HELP_VIEW.y + block.y + index * LINE_HEIGHT - Math.round(scrollTop), {
        color: block.heading ? '#7c4438' : '#171d19',
      });
    });
  }
  ctx.restore();
}
