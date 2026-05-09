import { OFFLINE_ORDER_CONTACT } from "@/lib/config";
import { PRICING_RULES } from "@/lib/pricing";
import { getQuoteCanonicalUrl, getSiteUrl, SITE_BRAND } from "@/lib/seo";
import {
  WORKSHOP_ADDRESS,
  WORKSHOP_GEO,
  WORKSHOP_MAPS_SHARE_URL,
} from "@/lib/workshop-location";

const LOCAL_ID = `${getSiteUrl()}#localbusiness`;
const SERVICE_ID = `${getSiteUrl()}#service-print-3d`;

function telToE164Vi(telHref: string): string | undefined {
  const m = /^tel:(\+?\d[\d\s-]*)$/i.exec(telHref.trim());
  if (!m) return undefined;
  const digits = m[1].replace(/\D/g, "");
  if (digits.startsWith("84")) return `+${digits}`;
  if (digits.startsWith("0")) return `+84${digits.slice(1)}`;
  if (digits.length >= 9) return `+${digits}`;
  return undefined;
}

type HomeJsonLdProps = {
  /** `workshop_info.contact_email` when available. */
  email?: string;
};

/**
 * LocalBusiness + Service JSON-LD for the homepage (Google rich results / knowledge panel hints).
 */
export function HomeJsonLd({ email }: HomeJsonLdProps) {
  const url = getSiteUrl();
  const telephone = telToE164Vi(OFFLINE_ORDER_CONTACT.zaloTelHref);
  const petgLow = Math.min(PRICING_RULES.PETG.normalVndPerGram, PRICING_RULES.PETG.studentVndPerGram);

  const localBusiness = {
    "@type": "LocalBusiness",
    "@id": LOCAL_ID,
    name: SITE_BRAND,
    alternateName: "Na Works",
    description:
      "Dịch vụ in 3D chuyên nghiệp, giá rẻ — ship COD toàn quốc; ưu đãi sinh viên. Xưởng NA 3D SHOP tại Bcons Miền Đông, 69 Tân Lập, Dĩ An, Bình Dương (gần Làng Đại Học Quốc Gia TP.HCM). Máy in buồng kín cho ABS & nhựa kỹ thuật (PETG-CF, PLA, PETG, TPU).",
    url,
    image: `${url}/logo-na_3d.png`,
    telephone,
    email: email?.trim() || undefined,
    hasMap: WORKSHOP_MAPS_SHARE_URL,
    geo: {
      "@type": "GeoCoordinates",
      latitude: WORKSHOP_GEO.latitude,
      longitude: WORKSHOP_GEO.longitude,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: WORKSHOP_ADDRESS.streetAddress,
      addressLocality: WORKSHOP_ADDRESS.addressLocality,
      addressRegion: WORKSHOP_ADDRESS.addressRegion,
      addressCountry: WORKSHOP_ADDRESS.addressCountry,
      postalCode: WORKSHOP_ADDRESS.postalCode,
    },
    areaServed: { "@type": "Country", name: "Vietnam" },
    priceRange: "$",
    sameAs: [OFFLINE_ORDER_CONTACT.fanpageUrl],
  };

  const service = {
    "@type": "Service",
    "@id": SERVICE_ID,
    name: "In 3D FDM theo file STL — ship toàn quốc",
    serviceType: "3D printing service",
    description:
      "Báo giá in 3D online, in giá rẻ; ship COD toàn quốc. Hỗ trợ PLA, PETG, PETG-CF, TPU và tư vấn ABS / nhựa kỹ thuật với máy buồng kín.",
    provider: { "@id": LOCAL_ID },
    areaServed: { "@type": "Country", name: "Vietnam" },
    offers: {
      "@type": "Offer",
      priceCurrency: "VND",
      description: `Giá tham chiếu từ khoảng ${petgLow.toLocaleString("vi-VN")} ₫/g (PETG); xem bảng giá đầy đủ trên website.`,
      url: getQuoteCanonicalUrl(),
    },
    category: "In 3D FDM — PLA, PETG, PETG-CF, TPU; ABS & nhựa kỹ thuật (buồng kín)",
  };

  const graph = [localBusiness, service];
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });

  return (
    <script
      type="application/ld+json"
      // JSON-LD is trusted static data from our own objects (no user input).
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
