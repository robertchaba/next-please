import type { DeskItemId } from './core/desk';

export type Button = {
  id: string; label: string; x: number; y: number; w: number; h: number;
  action?: () => void; href?: string;
  kind?: 'primary' | 'text' | 'lang' | 'sound' | 'volume' | 'previous' | 'next' | 'fullscreen' | 'hotspot' | 'fit' | 'unfit';
  pressed?: boolean;
  disabled?: boolean;
  item?: DeskItemId;
};
