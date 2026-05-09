/**
 * Official NA 3D SHOP (Na Works) workshop location for UI + LocalBusiness JSON-LD.
 * Geo taken from resolving the Google-provided maps short link ([!8m2!3d / !4d coordinates](maps)).
 */
export const WORKSHOP_PUBLIC_NAME = "NA 3D SHOP" as const;
export const WORKSHOP_LEGAL_SUFFIX = "(Na Works)" as const;

export const WORKSHOP_MAPS_SHARE_URL =
  "https://maps.app.goo.gl/KigdQu6NED2SZKzp7" as const;

/** Embed uses lat/lng for a stable pinpoint on Bcons Miền Đông. */
export const WORKSHOP_GEO = {
  latitude: 10.8769032,
  longitude: 106.8095182,
} as const;

export const WORKSHOP_ADDRESS = {
  /** Schema.org streetAddress — building + street gate line. */
  streetAddress: "69 Tân Lập, Bcons Miền Đông",
  addressLocality: "Dĩ An",
  addressRegion: "Bình Dương",
  addressCountry: "VN",
  /** From Google Maps redirect (optional PostalAddress). */
  postalCode: "75308",
} as const;

/** Full prose line for humans (contact cards, footer). */
export const WORKSHOP_FULL_ADDRESS_VI =
  "Bcons Miền Đông, 69 Tân Lập, Đông Hòa, Dĩ An, Bình Dương (Khu vực Làng Đại Học Quốc Gia TP.HCM)";

/** Google iframe src — query centred on coords (no Places API key). */
export const WORKSHOP_MAP_EMBED_SRC = `https://maps.google.com/maps?q=${WORKSHOP_GEO.latitude},${WORKSHOP_GEO.longitude}&hl=vi&z=17&output=embed`;
