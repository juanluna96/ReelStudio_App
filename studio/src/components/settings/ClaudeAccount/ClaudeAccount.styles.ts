import {cva} from 'class-variance-authority';

// Tailwind classes for the component (this app styles with Tailwind, not styled-components).
export const root = 'flex flex-col gap-3 border-t pt-3';
export const title = 'text-sm font-medium';
export const options = 'grid gap-2 sm:grid-cols-2';
export const option = cva('flex flex-col gap-0.5 rounded-lg border p-3 text-left transition-colors disabled:opacity-60', {
  variants: {on: {true: 'border-primary bg-primary/10', false: 'hover:bg-muted/50'}},
});
export const optionTitle = 'text-sm font-medium';
export const optionText = 'text-xs text-muted-foreground';
export const dir = 'font-mono text-xs break-all text-muted-foreground';
export const actions = 'flex flex-wrap items-center gap-2';
export const hint = 'text-xs text-muted-foreground';
