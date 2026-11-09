import {cva} from 'class-variance-authority';

// Tailwind classes for the component (this app styles with Tailwind, not styled-components).
export const root = 'visible-scroll flex flex-none items-center gap-2 overflow-x-auto pb-1';
export const chip = cva('group inline-flex h-8 flex-none items-center gap-1.5 rounded-full border pr-1 pl-3 text-sm font-medium whitespace-nowrap transition-all duration-150', {
  variants: {
    state: {
      active: 'shadow-sm ring-2 ring-current/30',
      idle: 'hover:brightness-110',
      dimmed: 'opacity-55 hover:opacity-100',
    },
  },
});
export const all = cva('inline-flex h-8 flex-none items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors', {
  variants: {active: {true: 'border-foreground/20 bg-foreground text-background', false: 'text-muted-foreground hover:bg-muted hover:text-foreground'}},
});
export const count = 'rounded-full bg-background/40 px-1.5 text-[11px] tabular-nums';
export const edit = 'grid size-6 place-items-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 hover:bg-background/40 focus-visible:opacity-100';
export const add = 'inline-flex h-8 flex-none items-center gap-1 rounded-full border border-dashed px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground';
