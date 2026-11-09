import {AUDIO_EXT, DOCUMENT_EXT, IMAGE_EXT, VIDEO_EXT} from './AttachmentChip.constants';
import type {AttachmentKind} from './AttachmentChip.types';

export const extOf = (name: string) => name.split('.').pop()?.toLowerCase() ?? '';

export function kindOf(name: string): AttachmentKind | null {
  const e = extOf(name);
  if (IMAGE_EXT.includes(e)) return 'image';
  if (['xlsx', 'xls', 'csv', 'tsv', 'ods'].includes(e)) return 'sheet';
  if (['pptx', 'ppt'].includes(e)) return 'slides';
  if (DOCUMENT_EXT.includes(e)) return 'document';
  if (AUDIO_EXT.includes(e)) return 'audio';
  if (VIDEO_EXT.includes(e)) return 'video';
  return null;
}

// A saved name (20261108-a1b2c3d4e5f6-informe-q3.pdf) reads as its original one (informe-q3.pdf).
export const labelOf = (name: string) => name.replace(/^\d{8}-[a-f0-9]{12}-?/, '') || name;

export function fmtSize(bytes?: number) {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.0', '')} MB`;
}
