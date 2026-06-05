/** Shared shape for the home “Printed models” carousel + optional lightbox details. */
export type ShowcaseGalleryItem = {
  id?: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  category?: string;
};
