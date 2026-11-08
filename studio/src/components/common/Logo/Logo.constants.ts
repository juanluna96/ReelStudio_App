// The Reel Studio mark, drawn on a 48×48 grid: a vertical 9:16 reel with a play triangle and a four-point
// spark (the AI) beside its top-right corner. The gradient colours are the brand's own, so they are fixed:
// violet → soft fuchsia reads on white and on near-black alike.
export const VIEW_BOX = '0 0 48 48';
export const GRADIENT_FROM = '#7C3AED';
export const GRADIENT_TO = '#D946EF';

export const REEL = {x: 6, y: 6, width: 22, height: 39, rx: 6};
export const PLAY = 'M13 20.2v10.6a1.2 1.2 0 0 0 1.8 1.04l8.6-5.3a1.2 1.2 0 0 0 0-2.08l-8.6-5.3a1.2 1.2 0 0 0-1.8 1.04z';
export const SPARK = 'M38 1.5Q39.4 7.6 45.5 9Q39.4 10.4 38 16.5Q36.6 10.4 30.5 9Q36.6 7.6 38 1.5Z';

export const DEFAULT_SIZE = 28;
export const NAME = 'Reel Studio';

// While something loads (the desktop app starting, the studio's first fetch): the reel breathes, the play
// fades in and out and the spark twinkles. Plain CSS so the desktop splash (desktop/main.ts), which isn't
// React, can use the very same animation; classes are the ones Logo.tsx puts on its shapes.
export const CLASS = {reel: 'logo-reel', play: 'logo-play', spark: 'logo-spark'};
export const ANIMATION_CSS = `
@keyframes logo-breathe { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.06) } }
@keyframes logo-play { 0%, 100% { opacity: 1; transform: translateX(0) } 50% { opacity: .55; transform: translateX(1.5px) } }
@keyframes logo-spark { 0%, 100% { transform: rotate(0deg) scale(.6); opacity: .5 } 50% { transform: rotate(90deg) scale(1.15); opacity: 1 } }
.logo-animated .${CLASS.reel}, .logo-animated .${CLASS.play}, .logo-animated .${CLASS.spark} { transform-box: fill-box; transform-origin: center }
.logo-animated .${CLASS.reel} { animation: logo-breathe 1.8s ease-in-out infinite }
.logo-animated .${CLASS.play} { animation: logo-play 1.8s ease-in-out infinite }
.logo-animated .${CLASS.spark} { animation: logo-spark 1.8s cubic-bezier(.4, 0, .2, 1) infinite }
@media (prefers-reduced-motion: reduce) { .logo-animated * { animation: none !important } }
`;

/** The mark as plain SVG markup (for pages outside React, like the desktop splash). */
export const markSvg = (size: number, animated = false) =>
  `<svg width="${size}" height="${size}" viewBox="${VIEW_BOX}" role="img" aria-label="${NAME}"${animated ? ' class="logo-animated"' : ''}>` +
  `<defs><linearGradient id="r" x1="6" y1="6" x2="28" y2="45" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${GRADIENT_FROM}"/><stop offset="1" stop-color="${GRADIENT_TO}"/></linearGradient>` +
  `<linearGradient id="s" x1="30.5" y1="1.5" x2="45.5" y2="16.5" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${GRADIENT_TO}"/><stop offset="1" stop-color="${GRADIENT_FROM}"/></linearGradient></defs>` +
  `<rect class="${CLASS.reel}" x="${REEL.x}" y="${REEL.y}" width="${REEL.width}" height="${REEL.height}" rx="${REEL.rx}" fill="url(#r)"/>` +
  `<path class="${CLASS.play}" d="${PLAY}" fill="#fff"/><path class="${CLASS.spark}" d="${SPARK}" fill="url(#s)"/></svg>`;
