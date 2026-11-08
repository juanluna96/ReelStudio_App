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

// While something loads (the desktop app starting, the studio's first fetch) the phone comes alive: a feed of
// reels scrolls inside it, one swipe per beat, with a progress bar that fills before each swipe; the reel
// breathes and the spark twinkles. The play waits: once it's loaded (.logo-loaded) the feed fades out and the
// play pops in, the moment before the studio opens. Plain CSS so the desktop splash (desktop/main.ts), which
// isn't React, uses the very same animation; classes are the ones Logo.tsx puts on its shapes.
export const CLASS = {reel: 'logo-reel', play: 'logo-play', spark: 'logo-spark', screen: 'logo-screen', feed: 'logo-feed', progress: 'logo-progress', loaded: 'logo-loaded'};
/** How long the finale (feed out, play in) takes, for whoever waits for it before moving on. */
export const FINALE_MS = 650;

// The screen inside the reel, only drawn while animated: posts (a thumbnail and two lines of text) one STEP apart,
// one more than fit so the swipe loops seamlessly, and the progress bar near the bottom.
export const SCREEN = {x: 9, width: 16};
export const STEP = 13;
export const POSTS = [9, 22, 35, 48];
export const BAR = {x: 9, y: 41.2, width: 16, height: 1.3, rx: 0.65};
const BEAT = '2.4s';

export const ANIMATION_CSS = `
@keyframes logo-breathe { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.05) } }
@keyframes logo-play-in { from { opacity: 0; transform: scale(.3) rotate(-20deg) } to { opacity: 1; transform: scale(1) rotate(0) } }
@keyframes logo-spark { 0%, 100% { transform: rotate(0deg) scale(.6); opacity: .5 } 50% { transform: rotate(90deg) scale(1.15); opacity: 1 } }
@keyframes logo-feed { 0%, 72% { transform: translateY(0) } 92%, 100% { transform: translateY(-${STEP}px) } }
@keyframes logo-progress { 0% { transform: scaleX(0); opacity: 1 } 72% { transform: scaleX(1); opacity: 1 } 92%, 100% { transform: scaleX(1); opacity: 0 } }
.logo-animated .${CLASS.reel}, .logo-animated .${CLASS.play}, .logo-animated .${CLASS.spark} { transform-box: fill-box; transform-origin: center }
.logo-animated .${CLASS.progress} { transform-box: fill-box; transform-origin: left center }
.logo-animated .${CLASS.reel} { animation: logo-breathe ${BEAT} ease-in-out infinite }
.logo-animated .${CLASS.play} { opacity: 0 }
.logo-animated.${CLASS.loaded} .${CLASS.play} { animation: logo-play-in .5s .15s cubic-bezier(.34, 1.56, .64, 1) both }
.logo-animated .${CLASS.screen} { transition: opacity .3s ease-out }
.logo-animated.${CLASS.loaded} .${CLASS.screen} { opacity: 0 }
.logo-animated .${CLASS.spark} { animation: logo-spark ${BEAT} cubic-bezier(.4, 0, .2, 1) infinite }
.logo-animated .${CLASS.feed} { animation: logo-feed ${BEAT} cubic-bezier(.65, 0, .35, 1) infinite }
.logo-animated .${CLASS.progress} { animation: logo-progress ${BEAT} linear infinite }
@media (prefers-reduced-motion: reduce) { .logo-animated * { animation: none !important } .logo-animated.${CLASS.loaded} .${CLASS.play} { opacity: 1 } }
`;

// The screen's markup (plain SVG, shared by Logo.tsx and markSvg); clip: the id of the reel's clipPath.
export const screenSvg = (clip: string) =>
  `<g class="${CLASS.screen}"><g clip-path="url(#${clip})"><g class="${CLASS.feed}">` +
  POSTS.map(
    (y) =>
      `<rect x="${SCREEN.x}" y="${y}" width="${SCREEN.width}" height="7" rx="1.5" fill="#fff" fill-opacity=".26"/>` +
      `<rect x="${SCREEN.x}" y="${y + 8.4}" width="12" height="1.3" rx=".65" fill="#fff" fill-opacity=".22"/>` +
      `<rect x="${SCREEN.x}" y="${y + 10.6}" width="8" height="1.3" rx=".65" fill="#fff" fill-opacity=".16"/>`,
  ).join('') +
  `</g></g>` +
  `<rect x="${BAR.x}" y="${BAR.y}" width="${BAR.width}" height="${BAR.height}" rx="${BAR.rx}" fill="#fff" fill-opacity=".22"/>` +
  `<rect class="${CLASS.progress}" x="${BAR.x}" y="${BAR.y}" width="${BAR.width}" height="${BAR.height}" rx="${BAR.rx}" fill="#fff"/></g>`;

/** The mark as plain SVG markup (for pages outside React, like the desktop splash). */
export const markSvg = (size: number, animated = false) =>
  `<svg width="${size}" height="${size}" viewBox="${VIEW_BOX}" role="img" aria-label="${NAME}"${animated ? ' class="logo-animated"' : ''}>` +
  `<defs><linearGradient id="r" x1="6" y1="6" x2="28" y2="45" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${GRADIENT_FROM}"/><stop offset="1" stop-color="${GRADIENT_TO}"/></linearGradient>` +
  `<linearGradient id="s" x1="30.5" y1="1.5" x2="45.5" y2="16.5" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${GRADIENT_TO}"/><stop offset="1" stop-color="${GRADIENT_FROM}"/></linearGradient>` +
  `<clipPath id="c"><rect x="${REEL.x}" y="${REEL.y}" width="${REEL.width}" height="${REEL.height}" rx="${REEL.rx}"/></clipPath></defs>` +
  `<rect class="${CLASS.reel}" x="${REEL.x}" y="${REEL.y}" width="${REEL.width}" height="${REEL.height}" rx="${REEL.rx}" fill="url(#r)"/>` +
  (animated ? screenSvg('c') : '') +
  `<path class="${CLASS.play}" d="${PLAY}" fill="#fff"/><path class="${CLASS.spark}" d="${SPARK}" fill="url(#s)"/></svg>`;
