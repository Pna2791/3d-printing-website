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

/** Slug SEO tiếng Việt cho trang báo giá (canonical chính). */
export const QUOTE_SEO_PATH = "/bao-gia-in-3d" as const;

/** English App Router slug — must match `lib/quote-paths` for hreflang & toggles. */
export const QUOTE_EN_SEO_PATH = "/en/3d-printing-quote" as const;

/**
 * URL tuyệt đối canonical cho trang báo giá (ưu tiên env, mặc định na3d.shop theo domain chính).
 * Dùng chung cho `/quote` và `/bao-gia-in-3d` để trỏ về một phiên bản duy nhất.
 */
export function getQuoteCanonicalUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_QUOTE_CANONICAL_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  return `https://na3d.shop${QUOTE_SEO_PATH}`;
}

export function getEnglishQuoteCanonicalUrl(): string {
  const base = getSiteUrl().replace(/\/$/, "");
  return `${base}${QUOTE_EN_SEO_PATH}`;
}

/** Tên thương hiệu hiển thị SEO & UI (đồng bộ metadata). */
export const SITE_BRAND = "NA 3D SHOP";

export const SEO_KEYWORDS = [
  "In 3D giá rẻ HCM",
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
  "In 3D Dĩ An",
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
  const titleDefault = `In 3D giá rẻ HCM (Thủ Đức) | Báo giá online | ${SITE_BRAND}`;
  const description =
    "Dịch vụ in 3D giá rẻ HCM, Thủ Đức cho sinh viên & kỹ sư. Báo giá online lấy liền, ship COD toàn quốc. Chuyên in ABS buồng kín, PLA, PETG-CF.";

  return {
    metadataBase: new URL(url),
    title: {
      default: titleDefault,
      template: `%s | ${SITE_BRAND}`,
    },
    description,
    alternates: {
      languages: {
        "vi-VN": "/",
        "en-US": "/en",
      },
    },
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
