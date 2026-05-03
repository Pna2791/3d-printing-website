import { OFFLINE_ORDER_CONTACT } from "@/lib/config";
import { PRICING_RULES } from "@/lib/pricing";
import { getSiteUrl, SITE_BRAND } from "@/lib/seo";

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
    description:
      "Dịch vụ in 3D chuyên nghiệp, giá rẻ — ship COD toàn quốc; ưu đãi sinh viên và khách TP.HCM. Xưởng tại Thủ Đức, Làng Đại Học; máy in buồng kín cho ABS & nhựa kỹ thuật (PETG-CF, PLA, PETG, TPU).",
    url,
    image: `${url}/logo-na_3d.png`,
    telephone,
    email: email?.trim() || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Thủ Đức",
      addressRegion: "Thành phố Hồ Chí Minh",
      addressCountry: "VN",
      streetAddress: "Khu vực Làng Đại Học",
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
      url: `${url}/quote`,
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
