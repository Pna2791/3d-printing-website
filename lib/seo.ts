import type { Metadata } from "next";

/** Public site origin for canonical URLs, Open Graph, and JSON-LD. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//i, "");
    return `https://${host}`;
  }
  return "https://na-3d.shop";
}

/** Tên thương hiệu hiển thị SEO & UI (đồng bộ metadata). */
export const SITE_BRAND = "NA 3D SHOP";

export const SEO_KEYWORDS = [
  "In 3D giá rẻ",
  "Ship COD toàn quốc",
  "In 3D toàn quốc",
  "Ưu đãi sinh viên",
  "Dịch vụ in 3D chuyên nghiệp",
  "Báo giá in 3D online",
  "Nhựa PETG-CF",
  "In ABS máy buồng kín",
  "Máy in buồng kín",
  "Nhựa kỹ thuật",
  "In 3D Thủ Đức",
  "In 3D Làng Đại Học",
  "In 3D TP.HCM",
  "in FDM",
  "PLA PETG TPU",
  "Na Works",
] as const;

const defaultOgImagePath = "/logo-na_3d.png";

export function absoluteOgImageUrl(): string {
  return `${getSiteUrl()}${defaultOgImagePath}`;
}

/** Root defaults merged with route-level `export const metadata`. */
export function rootLayoutMetadata(): Metadata {
  const url = getSiteUrl();
  const titleDefault = `In 3D Giá Rẻ Toàn Quốc | Ưu Đãi Sinh Viên | ${SITE_BRAND}`;
  const description =
    "Dịch vụ in 3D chuyên nghiệp, giá rẻ cho sinh viên. Hỗ trợ ship toàn quốc, ưu đãi lớn tại TP.HCM. Chuyên in ABS, PLA, PETG-CF với máy in buồng kín hiện đại.";

  return {
    metadataBase: new URL(url),
    title: {
      default: titleDefault,
      template: `%s | ${SITE_BRAND}`,
    },
    description,
    keywords: [...SEO_KEYWORDS],
    authors: [{ name: SITE_BRAND }],
    creator: SITE_BRAND,
    openGraph: {
      type: "website",
      locale: "vi_VN",
      url,
      siteName: SITE_BRAND,
      title: titleDefault,
      description,
      images: [
        {
          url: defaultOgImagePath,
          width: 512,
          height: 512,
          alt: `${SITE_BRAND} — In 3D giá rẻ, ship toàn quốc`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description,
      images: [defaultOgImagePath],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
