import {MAX_SCALE, MIN_SCALE} from './ImageLightbox.constants';

export type View = {scale: number; x: number; y: number};
export const FIT: View = {scale: 1, x: 0, y: 0};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// Zoom to `scale` keeping the point under (px, py) — relative to the stage's centre — where it is.
export function zoomAt(v: View, scale: number, px: number, py: number): View {
  const s = clamp(scale, MIN_SCALE, MAX_SCALE);
  if (s === MIN_SCALE) return FIT;
  const ix = (px - v.x) / v.scale;
  const iy = (py - v.y) / v.scale;
  return {scale: s, x: px - ix * s, y: py - iy * s};
}

// A file name for «Descargar»: the last part of the url, without its query.
export const fileName = (src: string) => decodeURIComponent(src.split('?')[0].split('/').pop() || 'imagen');
