import {useEffect, useRef, useState} from 'react';
import {useLightboxStore} from '@/store/useLightboxStore';
import {DOUBLE_CLICK_SCALE, STEP} from './ImageLightbox.constants';
import {FIT, zoomAt, type View} from './ImageLightbox.utils';

// The viewer's zoom and pan: the wheel or a trackpad pinch zooms towards the pointer, dragging pans once zoomed,
// double click toggles fit / zoomed in, and the keys: Esc, ← →, + − and 0.
export function useImageLightbox() {
  const {images, index, close, go} = useLightboxStore();
  const src = images[index] ?? null;
  const [view, setView] = useState<View>(FIT);
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{x: number; y: number; vx: number; vy: number; moved: boolean} | null>(null);
  // While dragging the image follows the pointer at once (no easing).
  const [dragging, setDragging] = useState(false);

  // Each image opens fitted to the window.
  useEffect(() => setView(FIT), [src]);

  // Pointer position relative to the stage's centre.
  const fromCentre = (cx: number, cy: number) => {
    const r = stage.current!.getBoundingClientRect();
    return [cx - (r.left + r.width / 2), cy - (r.top + r.height / 2)] as const;
  };
  const zoomBy = (factor: number, cx?: number, cy?: number) =>
    setView((v) => {
      const [px, py] = cx === undefined ? [0, 0] : fromCentre(cx, cy!);
      return zoomAt(v, v.scale * factor, px, py);
    });

  useEffect(() => {
    if (!src) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === '+' || e.key === '=') zoomBy(STEP);
      else if (e.key === '-') zoomBy(1 / STEP);
      else if (e.key === '0') setView(FIT);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [src, close, go]);

  // Not a React onWheel: it has to be non-passive to stop the page (and the browser's own zoom) from moving.
  useEffect(() => {
    const el = stage.current;
    if (!el || !src) return;
    const on = (e: WheelEvent) => {
      e.preventDefault();
      // A pinch comes as a wheel with ctrlKey and small deltas.
      const k = e.ctrlKey ? 0.012 : 0.0018;
      zoomBy(Math.exp(-e.deltaY * k), e.clientX, e.clientY);
    };
    el.addEventListener('wheel', on, {passive: false});
    return () => el.removeEventListener('wheel', on);
  }, [src]);

  const onPointerDown = (e: React.PointerEvent) => {
    // The arrows and the toolbar stay buttons, even zoomed in.
    if (e.button !== 0 || view.scale === 1 || (e.target as HTMLElement).closest('button, a')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false};
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
    setView((v) => ({...v, x: d.vx + dx, y: d.vy + dy}));
  };
  const onPointerUp = () => {
    // Kept until the click that follows, so a drag that ends on the backdrop doesn't close it.
    setTimeout(() => (drag.current = null));
    setDragging(false);
  };
  const onDoubleClick = (e: React.MouseEvent) => {
    const [px, py] = fromCentre(e.clientX, e.clientY);
    setView((v) => (v.scale > 1 ? FIT : zoomAt(v, DOUBLE_CLICK_SCALE, px, py)));
  };
  // A click on the backdrop (not the image, not after dragging) closes it.
  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !drag.current?.moved) close();
  };

  return {
    src,
    count: images.length,
    index,
    view,
    dragging,
    stage,
    close,
    prev: () => go(-1),
    next: () => go(1),
    zoomIn: () => zoomBy(STEP),
    zoomOut: () => zoomBy(1 / STEP),
    fit: () => setView(FIT),
    handlers: {onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onDoubleClick},
    onBackdrop,
  };
}
