// The image viewer (components/common/ImageLightbox): which images it shows and which one is open.
export interface LightboxState {
  /** The images it can go through (e.g. all of one message); empty: closed. */
  images: string[];
  index: number;
  open: (images: string[], index?: number) => void;
  close: () => void;
  /** Next (+1) or previous (-1), wrapping around. */
  go: (delta: number) => void;
}
