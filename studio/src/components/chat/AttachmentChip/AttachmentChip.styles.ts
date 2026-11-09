import {cva} from 'class-variance-authority';

// Tailwind classes for the component (this app styles with Tailwind, not styled-components).
export const root = cva('group/att animate-fade-in relative flex h-12 max-w-56 min-w-0 items-center gap-2 rounded-lg border pr-2.5 pl-1.5 text-left transition-colors', {
  variants: {
    inverted: {true: 'border-primary-foreground/20 bg-primary-foreground/10 hover:bg-primary-foreground/15', false: 'bg-background hover:bg-muted'},
    error: {true: 'border-destructive/60', false: ''},
  },
});
export const icon = cva('grid size-9 flex-none place-items-center rounded-md', {
  variants: {
    kind: {
      image: 'bg-sky-500/15 text-sky-400',
      document: 'bg-blue-500/15 text-blue-400',
      sheet: 'bg-emerald-500/15 text-emerald-400',
      slides: 'bg-orange-500/15 text-orange-400',
      audio: 'bg-pink-500/15 text-pink-400',
      video: 'bg-violet-500/15 text-violet-400',
    },
  },
});
export const text = 'flex min-w-0 flex-col leading-tight';
export const name = 'truncate text-xs font-medium';
export const meta = cva('truncate text-[11px] uppercase', {variants: {inverted: {true: 'text-primary-foreground/70', false: 'text-muted-foreground'}}});
export const remove =
  'absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border bg-background text-muted-foreground opacity-0 group-hover/att:opacity-100 hover:text-foreground focus:opacity-100';
