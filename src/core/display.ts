export const WIDTH = 570;
export const HEIGHT = 320;

/** Whole CSS-pixel multiples above native size; fit only when a screen is too small. */
export function getScale(width: number, height: number): number {
  const fit = Math.min(width / WIDTH, height / HEIGHT);
  return fit >= 1 ? Math.floor(fit) : Math.max(0.1, fit);
}

export function installDisplay(app: HTMLElement, viewport: HTMLElement, stage: HTMLElement): void {
  const resize = () => {
    const fullscreen = Boolean(document.fullscreenElement);
    const style = getComputedStyle(app);
    const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const width = window.innerWidth - paddingX;
    const surrounds = [...app.querySelectorAll<HTMLElement>('.surround-top, .surround-bottom')];
    const gap = parseFloat(style.rowGap) || 0;
    // Measure the actual text rows, including wrapping, before choosing a scale.
    // Start wide, then shrink until the frame and its surrounding text both fit.
    let scale = getScale(width, window.innerHeight - paddingY);
    while (true) {
      app.style.setProperty('--game-width', `${WIDTH * scale}px`);
      const chrome = fullscreen ? 0 : surrounds.reduce((height, element) => height + element.getBoundingClientRect().height, 0);
      const visibleRows = surrounds.filter(element => element.getBoundingClientRect().height > 0).length;
      const fitted = getScale(width, window.innerHeight - paddingY - chrome - gap * visibleRows);
      if (fitted >= scale) break;
      scale = fitted;
    }
    viewport.style.width = `${WIDTH * scale}px`;
    viewport.style.height = `${HEIGHT * scale}px`;
    stage.style.transform = `scale(${scale})`;
    app.style.setProperty('--game-width', `${WIDTH * scale}px`);
    app.dataset.scale = String(scale);
  };
  window.addEventListener('resize', resize);
  document.addEventListener('fullscreenchange', resize);
  new ResizeObserver(resize).observe(app.querySelector('.surround-top')!);
  new ResizeObserver(resize).observe(app.querySelector('.surround-bottom')!);
  resize();
}

/** Original 12×16 arrow, drawn at 2× for a legible native OS cursor. */
export function installCursor(stage: HTMLElement): void {
  const cursor = document.createElement('canvas');
  cursor.width = 24; cursor.height = 32;
  const ctx = cursor.getContext('2d')!;
  const rows = ['100000000000', '110000000000', '121000000000', '122100000000', '122210000000', '122221000000', '122222100000', '122222210000', '122222221000', '122222222100', '122222111110', '122122100000', '121012210000', '110012210000', '100001221000', '000001110000'];
  rows.forEach((row, y) => [...row].forEach((pixel, x) => {
    if (pixel === '0') return;
    ctx.fillStyle = pixel === '1' ? '#171b19' : '#ddd5b4';
    ctx.fillRect(x * 2, y * 2, 2, 2);
  }));
  stage.style.cursor = `url(${cursor.toDataURL()}) 0 0, default`;
}
