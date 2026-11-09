export type AttachmentKind = 'image' | 'document' | 'sheet' | 'slides' | 'audio' | 'video';

export interface AttachmentChipProps {
  /** The file's name: the original one while it uploads, the saved one (with its prefix) once sent. */
  name: string;
  size?: number;
  /** Still uploading, or failed (its message shows on hover). */
  uploading?: boolean;
  error?: string;
  /** Where it opens (a sent message's file). */
  href?: string;
  onRemove?: () => void;
  /** On the user's own bubble (primary background). */
  inverted?: boolean;
}
