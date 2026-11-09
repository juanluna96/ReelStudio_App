import {create} from 'zustand';
import type {LightboxState} from './lightbox.types';

// One viewer for the whole app: any page opens it with the images it has (the chat's, a video's boards…).
export const useLightboxStore = create<LightboxState>((set, get) => ({
  images: [],
  index: 0,
  open: (images, index = 0) => set({images, index: Math.max(0, Math.min(index, images.length - 1))}),
  close: () => set({images: [], index: 0}),
  go: (delta) => {
    const {images, index} = get();
    if (images.length > 1) set({index: (index + delta + images.length) % images.length});
  },
}));
