import type { DeskItemId, Point, Rect } from './desk';

type DeskInputOptions = {
  enabled: () => boolean;
  rect: (id: DeskItemId) => Rect;
  begin: (id: DeskItemId) => void;
  move: (id: DeskItemId, point: Point) => void;
  drop: (id: DeskItemId) => void;
  cancel: () => void;
};

/** Pointer capture and keyboard carrying share the same logical-pixel movement. */
export function installDeskInput(stage: HTMLElement, options: DeskInputOptions): { cancel: () => void } {
  let held: DeskItemId | null = null;
  let pointer: { id: number; item: DeskItemId; start: Point; offset: Point } | null = null;
  let suppressClick = false;
  const point = (event: PointerEvent): Point => {
    const bounds = stage.getBoundingClientRect();
    return { x: Math.round((event.clientX - bounds.left) * 570 / bounds.width), y: Math.round((event.clientY - bounds.top) * 320 / bounds.height) };
  };
  const release = (): void => {
    const id = pointer?.id;
    pointer = null;
    if (id !== undefined && stage.hasPointerCapture(id)) stage.releasePointerCapture(id);
  };
  const cancel = (): void => {
    if (held) { held = null; options.cancel(); }
    release();
  };
  const stopClick = (): void => {
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 0);
  };
  stage.addEventListener('click', event => {
    if ((suppressClick && event.detail > 0) || held) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  stage.addEventListener('pointerdown', event => {
    if (!options.enabled() || event.button !== 0 || held || pointer) return;
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-item]');
    if (!target) return;
    const item = target.dataset.item as DeskItemId;
    const start = point(event), rect = options.rect(item);
    pointer = { id: event.pointerId, item, start, offset: { x: start.x - rect.x, y: start.y - rect.y } };
    // Capture only after the drag threshold, so ordinary clicks keep their target.
  });
  stage.addEventListener('pointermove', event => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const current = point(event);
    if (!held && Math.hypot(current.x - pointer.start.x, current.y - pointer.start.y) < 3) return;
    if (!held) {
      held = pointer.item; stage.setPointerCapture(pointer.id); options.begin(held);
    }
    event.preventDefault();
    options.move(held, { x: current.x - pointer.offset.x, y: current.y - pointer.offset.y });
  });
  stage.addEventListener('pointerup', event => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const item = held;
    held = null; release();
    if (item) { stopClick(); options.drop(item); }
  });
  stage.addEventListener('pointercancel', cancel);
  stage.addEventListener('lostpointercapture', event => {
    // Touch begins with implicit capture on the item. Transferring it to the
    // stage is expected and must not cancel the newly started drag.
    if (event.target === stage && pointer && event.pointerId === pointer.id) cancel();
  });
  window.addEventListener('pointerup', event => {
    if (!held && pointer?.id === event.pointerId) release();
  });
  stage.addEventListener('keydown', event => {
    if (!options.enabled() || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-item]');
    if (!held && event.code === 'Space' && target) {
      event.preventDefault(); event.stopPropagation();
      held = target.dataset.item as DeskItemId; options.begin(held); return;
    }
    if (!held) return;
    if (event.key === 'Tab') { cancel(); return; }
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); stopClick(); cancel(); return; }
    if (event.key === 'Enter' || event.code === 'Space') {
      event.preventDefault(); event.stopPropagation();
      const item = held; held = null; release(); stopClick(); options.drop(item); return;
    }
    const vectors: Record<string, Point> = { ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 } };
    const direction = vectors[event.key];
    if (direction) {
      event.preventDefault(); event.stopPropagation();
      const position = options.rect(held), step = event.shiftKey ? 12 : 4;
      options.move(held, { x: position.x + direction.x * step, y: position.y + direction.y * step });
    }
  });
  stage.addEventListener('focusout', event => {
    if (held && !stage.contains(event.relatedTarget as Node | null)) cancel();
  });
  window.addEventListener('blur', cancel);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
  return { cancel };
}
