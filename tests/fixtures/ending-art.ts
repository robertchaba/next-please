import { expect, type Page } from '@playwright/test';

/** Compare the unobscured illustration, not just its requested URL or screen name. */
export async function expectEndingArt(page: Page, asset: string): Promise<void> {
  await expect(page.locator('#stage')).toHaveAttribute('data-art-ready', 'true');
  expect(await page.evaluate(async name => {
    const image = new Image();
    image.src = `assets/art/${name}.png`;
    await image.decode();
    const reference = document.createElement('canvas');
    reference.width = 570; reference.height = 320;
    const context = reference.getContext('2d')!;
    context.drawImage(image, 0, 0);
    const expected = context.getImageData(350, 170, 220, 150).data;
    const actual = (document.querySelector('#game') as HTMLCanvasElement).getContext('2d')!.getImageData(350, 170, 220, 150).data;
    return actual.every((value, index) => value === expected[index]);
  }, asset)).toBe(true);
}
