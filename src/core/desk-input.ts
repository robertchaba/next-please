import { itemAnchor, restRect, type DeskItemId, type Point, type Rect } from './desk';

type DeskInputOptions = {
  enabled: () => boolean;
  rect: (id: DeskItemId) => Rect;
  begin: (id: DeskItemId, chargeHandling: boolean) => void;
  move: (id: DeskItemId, point: Point) => void;
  /** Return true when the item was put down; false keeps the tool in hand. */
  drop: (id: DeskItemId, point?: Point, targetItem?: DeskItemId) => boolean;
  cancel: () => void;
};

/** Click to carry, click again to place or use. No mouse button needs to stay down. */
export function installDeskInput(stage: HTMLElement, options: DeskInputOptions): { cancel: () => void; putAway: (id: DeskItemId) => void; pickUp: (id: DeskItemId, chargeHandling?: boolean) => void } {
  let held: DeskItemId | null = null;
  let activating = false;
  const point = (event: MouseEvent): Point => {
    const bounds = stage.getBoundingClientRect();
    return { x: Math.round((event.clientX - bounds.left) * 570 / bounds.width), y: Math.round((event.clientY - bounds.top) * 320 / bounds.height) };
  };
  const cancel = (): void => {
    if (!held) return;
    held = null;
    options.cancel();
  };
  const moveToPointer = (current: Point): void => {
    if (!held) return;
    const anchor = itemAnchor(held, options.rect(held));
    options.move(held, { x: current.x - anchor.x, y: current.y - anchor.y });
  };
  const activate = (current?: Point, targetItem?: DeskItemId): void => {
    if (!held) return;
    const item = held;
    activating = true;
    try {
      if (options.drop(item, current, targetItem)) held = null;
    } finally { activating = false; }
  };
  const pickUp = (id: DeskItemId, chargeHandling = true): void => {
    held = id;
    activating = true;
    try { options.begin(id, chargeHandling); }
    finally { activating = false; }
  };
  const putAway = (id: DeskItemId): void => {
    const rest = restRect(id);
    if (held !== id || !rest) return;
    options.move(id, rest);
    activate({ x: rest.x + Math.floor(rest.w / 2), y: rest.y + Math.floor(rest.h / 2) });
  };
  stage.addEventListener('click', event => {
    // Keyboard and assistive activation retain the controls' normal actions.
    if (!options.enabled() || event.detail === 0 || event.button !== 0) return;
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-item]');
    if (!held && !target) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const current = point(event);
    if (held) {
      moveToPointer(current);
      activate(current);
    } else if (target) {
      pickUp(target.dataset.item as DeskItemId);
      moveToPointer(current);
    }
  }, true);
  stage.addEventListener('pointerdown', event => {
    // A second touch can land on bare desk. Keep focus on the carried control
    // until its click is handled instead of cancelling when the browser blurs it.
    if (held && options.enabled() && event.button === 0) event.preventDefault();
  });
  stage.addEventListener('pointermove', event => {
    if (!held || !options.enabled() || event.pointerType === 'touch') return;
    moveToPointer(point(event));
  });
  stage.addEventListener('pointercancel', cancel);
  stage.addEventListener('keydown', event => {
    if (!options.enabled() || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-item]');
    if (!held && event.code === 'Space' && target) {
      event.preventDefault(); event.stopPropagation();
      pickUp(target.dataset.item as DeskItemId); return;
    }
    if (!held) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); cancel(); return; }
    if (event.key === 'Enter' || event.code === 'Space') {
      // The semantic holder buttons let keyboard users put tools away directly.
      if ((event.target as HTMLElement).id.startsWith('control-put-away-')) return;
      event.preventDefault(); event.stopPropagation();
      const control = event.target as HTMLElement;
      const attachedClip = control.id === 'control-certificate-clip' || control.id.startsWith('control-paper-clip-');
      if (((held === 'document' || held.startsWith('paper-')) && control.id === 'control-return-document')
        || ((held === 'incoming-referral' || held.startsWith('paper-') || held.startsWith('clip-') || held === 'manual') && ['control-drawer', 'control-trash'].includes(control.id))
        || (held.startsWith('clip-') && (control.dataset.item?.startsWith('paper-') || control.dataset.item === 'document'))
        || ((held === 'document' || held === 'incoming-referral' || held.startsWith('paper-')) && attachedClip)) {
        activate({ x: parseFloat(control.style.left) + parseFloat(control.style.width) / 2,
          y: parseFloat(control.style.top) + parseFloat(control.style.height) / 2 }, (control.dataset.owner ?? control.dataset.item) as DeskItemId | undefined);
        return;
      }
      activate(); return;
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
    // Rebuilding semantic controls temporarily removes the focused node. Only
    // a real focus destination outside the stage means leaving it; window blur
    // and outside pointer presses retain their separate cancellation handlers.
    if (!activating && held && event.relatedTarget && !stage.contains(event.relatedTarget as Node)) cancel();
  });
  window.addEventListener('pointerdown', event => {
    if (held && !stage.contains(event.target as Node)) cancel();
  });
  window.addEventListener('blur', cancel);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
  return { cancel, putAway, pickUp };
}
