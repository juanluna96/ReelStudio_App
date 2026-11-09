import {ChevronLeft, ChevronRight, Download, Maximize, Minus, Plus, X} from 'lucide-react';
import {cn} from '@/lib/utils';
import {MAX_SCALE} from './ImageLightbox.constants';
import {useImageLightbox} from './ImageLightbox.hook';
import * as s from './ImageLightbox.styles';
import {fileName} from './ImageLightbox.utils';

// The image viewer, over the whole window: zoom with the wheel, a pinch, double click or + −; drag to look around;
// ← → through the images it was opened with. Opened from anywhere with useLightboxStore().open(images, index).
export default function ImageLightbox() {
  const lb = useImageLightbox();
  if (!lb.src) return null;
  const {scale, x, y} = lb.view;
  return (
    <div role="dialog" aria-modal="true" aria-label="Imagen ampliada" className={s.root}>
      <div className={s.bar}>
        <span className={s.count}>{lb.count > 1 ? `${lb.index + 1} / ${lb.count}` : ''}</span>
        <button type="button" onClick={lb.zoomOut} disabled={scale <= 1} className={s.tool} title="Alejar (−)" aria-label="Alejar">
          <Minus className="size-4" />
        </button>
        <span className={s.pct}>{Math.round(scale * 100)} %</span>
        <button type="button" onClick={lb.zoomIn} disabled={scale >= MAX_SCALE} className={s.tool} title="Acercar (+)" aria-label="Acercar">
          <Plus className="size-4" />
        </button>
        <button type="button" onClick={lb.fit} disabled={scale === 1} className={s.tool} title="Ajustar a la ventana (0)" aria-label="Ajustar a la ventana">
          <Maximize className="size-4" />
        </button>
        <a href={lb.src} download={fileName(lb.src)} className={s.tool} title="Descargar" aria-label="Descargar">
          <Download className="size-4" />
        </a>
        <button type="button" onClick={lb.close} className={s.tool} title="Cerrar (Esc)" aria-label="Cerrar">
          <X className="size-5" />
        </button>
      </div>
      <div ref={lb.stage} className={cn(s.stage, scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in')} onClick={lb.onBackdrop} {...lb.handlers}>
        <img
          key={lb.src}
          src={lb.src}
          alt=""
          draggable={false}
          className={s.image}
          style={{transform: `translate(${x}px, ${y}px) scale(${scale})`, transition: lb.dragging ? 'none' : 'transform 120ms ease-out'}}
        />
        {lb.count > 1 && (
          <>
            <button type="button" onClick={lb.prev} className={cn(s.nav, 'left-4')} aria-label="Imagen anterior" title="Anterior (←)">
              <ChevronLeft className="size-6" />
            </button>
            <button type="button" onClick={lb.next} className={cn(s.nav, 'right-4')} aria-label="Imagen siguiente" title="Siguiente (→)">
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>
      <p className={s.hint}>Rueda o pellizca para acercar · arrastra para moverte · doble clic para ampliar o ajustar · Esc para cerrar</p>
    </div>
  );
}
