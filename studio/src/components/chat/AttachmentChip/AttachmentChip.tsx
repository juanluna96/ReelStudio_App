import {FileAudio, FileImage, FileSpreadsheet, FileText, FileVideo, Loader2, Presentation, X} from 'lucide-react';
import * as s from './AttachmentChip.styles';
import type {AttachmentChipProps, AttachmentKind} from './AttachmentChip.types';
import {extOf, fmtSize, kindOf, labelOf} from './AttachmentChip.utils';

const ICONS: Record<AttachmentKind, typeof FileText> = {image: FileImage, document: FileText, sheet: FileSpreadsheet, slides: Presentation, audio: FileAudio, video: FileVideo};

// A file attached to a message (a document, a spreadsheet, audio, video): its kind's icon in its colour, its name,
// and its type and size. While uploading, a spinner; if it failed, a red edge and the reason on hover.
export default function AttachmentChip({name, size, uploading, error, href, onRemove, inverted = false}: AttachmentChipProps) {
  const kind = kindOf(name) ?? 'document';
  const Icon = ICONS[kind];
  const label = labelOf(name);
  const meta = error ? 'No se pudo subir' : [extOf(name), fmtSize(size)].filter(Boolean).join(' · ');
  const body = (
    <>
      <span className={s.icon({kind})}>{uploading ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4" />}</span>
      <span className={s.text}>
        <span className={s.name}>{label}</span>
        <span className={s.meta({inverted})}>{meta}</span>
      </span>
    </>
  );
  return (
    <div className={s.root({inverted, error: !!error})} title={error ?? label}>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-2" title={`Abrir ${label}`}>
          {body}
        </a>
      ) : (
        body
      )}
      {onRemove && (
        <button type="button" onClick={onRemove} title="Quitar" aria-label={`Quitar ${label}`} className={s.remove}>
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}
