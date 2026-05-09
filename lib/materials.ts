import type { AppLocale } from "@/lib/i18n-dictionary";
import { PRICING_RULES, type SupportedMaterial } from "@/lib/pricing";

/** Relative price tier (1 = lowest normal rate in shop) for guide / comparison copy. */
export type MaterialPriceTier = 1 | 2 | 3 | 4;

export type MaterialComparisonRow = {
  strengthVi: string;
  strengthEn: string;
  flexibilityVi: string;
  flexibilityEn: string;
  heatResistanceVi: string;
  heatResistanceEn: string;
  priceLevelVi: string;
  priceLevelEn: string;
  priceTier: MaterialPriceTier;
};

export type MaterialGuideEntry = {
  id: SupportedMaterial;
  /** Short paragraph for listings / SEO bridges. */
  descriptionVi: string;
  descriptionEn: string;
  /** Một dòng cho tooltip / hover (tiếng Việt). */
  summaryLineVi: string;
  /** Tooltip line for English quote UI. */
  summaryLineEn: string;
  /** Đặc điểm chính (ngắn). */
  traitsVi: string[];
  traitsEn: string[];
  /** Ứng dụng gợi ý. */
  useCasesVi: string[];
  useCasesEn: string[];
  /** Gợi ý nổi bật (Emerald trên UI). */
  bestForVi: string;
  bestForEn: string;
  /** Gạch đầu dòng “khi nào nên chọn”. */
  whenToChooseBulletsVi: string[];
  whenToChooseBulletsEn: string[];
  comparison: MaterialComparisonRow;
};

function priceTierFor(material: SupportedMaterial): MaterialPriceTier {
  const n = PRICING_RULES[material].normalVndPerGram;
  if (n <= 400) return 1;
  if (n <= 500) return 2;
  if (n <= 600) return 3;
  return 4;
}

export type PickedMaterialComparison = {
  strength: string;
  flexibility: string;
  heatResistance: string;
  priceLevel: string;
};

export function pickMaterialStrings(entry: MaterialGuideEntry, locale: AppLocale): {
  description: string;
  traits: string[];
  useCases: string[];
  bestFor: string;
  whenBullets: string[];
  comparison: PickedMaterialComparison;
} {
  const en = locale === "en";
  const c = entry.comparison;
  return {
    description: en ? entry.descriptionEn : entry.descriptionVi,
    traits: en ? entry.traitsEn : entry.traitsVi,
    useCases: en ? entry.useCasesEn : entry.useCasesVi,
    bestFor: en ? entry.bestForEn : entry.bestForVi,
    whenBullets: en ? entry.whenToChooseBulletsEn : entry.whenToChooseBulletsVi,
    comparison: {
      strength: en ? c.strengthEn : c.strengthVi,
      flexibility: en ? c.flexibilityEn : c.flexibilityVi,
      heatResistance: en ? c.heatResistanceEn : c.heatResistanceVi,
      priceLevel: en ? c.priceLevelEn : c.priceLevelVi,
    },
  };
}

function priceLevelLabelVi(material: SupportedMaterial): string {
  const tier = priceTierFor(material);
  const suffix =
    material === "PETG-CF"
      ? " — composite sợi carbon cao cấp, phù hợp chi tiết chịu lực."
      : material === "TPU"
        ? " — nhựa dẻo cao cấp, giá theo gam cao nhất trong nhóm."
        : "";
  const base: Record<MaterialPriceTier, string> = {
    1: "Thấp nhất trong bảng giá hiện tại (tiết kiệm cho in chức năng).",
    2: "Trung bình.",
    3: "Trung bình đến cao.",
    4: "Cao nhất trong bảng giá hiện tại.",
  };
  return base[tier] + suffix;
}

function priceLevelLabelEn(material: SupportedMaterial): string {
  const tier = priceTierFor(material);
  const suffix =
    material === "PETG-CF"
      ? " — carbon composite, engineered structural parts."
      : material === "TPU"
        ? " — premium flexible filament; highest per-gram tariff in our lineup."
        : "";
  const base: Record<MaterialPriceTier, string> = {
    1: "Lowest in the current roster (economical functional prints).",
    2: "Mid-tier.",
    3: "Mid-high.",
    4: "Highest in the current roster.",
  };
  return base[tier] + suffix;
}

export const MATERIAL_GUIDE: Record<SupportedMaterial, MaterialGuideEntry> = {
  PLA: {
    id: "PLA",
    descriptionVi:
      "PLA dễ in, hoàn thiện đẹp, nhiều màu — phù hợp mô hình trang trí và prototype chi phí hợp lý.",
    descriptionEn:
      "PLA is easy-running with great surface quality—perfect for décor models and fast prototypes on a modest budget.",
    summaryLineVi:
      "PLA: Dễ in, bề mặt đẹp, nhiều màu — hơi giòn, phù hợp mô hình trang trí & prototype.",
    summaryLineEn:
      "PLA: Easy to print, smooth finish, lots of colours — somewhat brittle; best for décor models & quick prototypes.",
    traitsVi: ["Dễ in", "Thẩm mỹ tốt", "Nhiều màu", "Tương đối giòn"],
    traitsEn: ["Easy prints", "Great cosmetics", "Colour variety", "Relatively brittle"],
    useCasesVi: ["Mô hình trang trí", "Prototype nhanh", "Đồ chơi bàn làm việc"],
    useCasesEn: ["Desk décor", "Concept prototypes", "Display models"],
    bestForVi: "Mô hình trang trí, prototype và đồ trưng bày — dễ in, chi phí nhựa theo gam ở mức trung bình.",
    bestForEn: "Decoration models and display pieces—straightforward tuning with mid-tier per-gram pricing.",
    whenToChooseBulletsVi: [
      "Bạn ưu tiên độ đẹp bề mặt và in thử ý tưởng nhanh.",
      "Chi tiết không chịu tải lớn hoặc nhiệt cao.",
      "Bạn muốn nhiều lựa chọn màu sắc.",
    ],
    whenToChooseBulletsEn: [
      "Surface cosmetics and idea validation matter most.",
      "Parts won’t endure heavy shocks or prolonged heat.",
      "You want the widest palette options.",
    ],
    comparison: {
      strengthVi: "Trung bình (dễ gãy khi va đập mạnh)",
      strengthEn: "Medium (can crack under hard impacts)",
      flexibilityVi: "Cứng",
      flexibilityEn: "Rigid",
      heatResistanceVi: "Thấp — tránh môi trường nóng lâu",
      heatResistanceEn: "Low — avoid prolonged hot environments",
      priceLevelVi: priceLevelLabelVi("PLA"),
      priceLevelEn: priceLevelLabelEn("PLA"),
      priceTier: priceTierFor("PLA"),
    },
  },
  PETG: {
    id: "PETG",
    descriptionVi:
      "PETG dai hơn PLA, chịu ẩm nhẹ — lựa chọn mặc định cho linh kiện cơ khí và chi tiết ngoài trời ngắn hạn.",
    descriptionEn:
      "PETG stacks tougher than PLA with forgiving moisture behaviour—perfect for engineered brackets and light outdoor duty cycles.",
    summaryLineVi:
      "PETG: Bền, chịu ẩm tốt, hơi dẻo — phù hợp linh kiện cơ khí & dùng ngoài trời.",
    summaryLineEn:
      "PETG: Tougher than PLA, good moisture resistance, slight flex — mechanical parts & light outdoor use.",
    traitsVi: ["Bền", "Chống thấm nước tốt", "Hơi dẻo so với PLA"],
    traitsEn: ["Tough", "Moisture tolerant", "Slight flex vs PLA"],
    useCasesVi: ["Chi tiết chức năng", "Linh kiện cơ khí", "Ứng dụng ngoài trời"],
    useCasesEn: ["Functional parts", "Mechanical mounts", "Short outdoor exposures"],
    bestForVi: "Linh kiện vừa bền vừa tiết kiệm — mức giá theo gam thấp nhất trong các loại đang phục vụ.",
    bestForEn: "Our default engineering sweet spot—the lowest per-gram rate among serviced materials today.",
    whenToChooseBulletsVi: [
      "Cần độ bền va đập tốt hơn PLA và ít giòn hơn.",
      "Tiếp xúc ẩm / môi trường ngoài trời nhẹ.",
      "Ưu tiên chi phí nhựa hợp lý cho in chức năng.",
    ],
    whenToChooseBulletsEn: [
      "Impact toughness must outperform brittle PLA.",
      "Ambient humidity or quick outdoor exposures show up.",
      "Cost-sensitive engineered plastic is mandatory.",
    ],
    comparison: {
      strengthVi: "Cao hơn PLA",
      strengthEn: "Higher than PLA",
      flexibilityVi: "Hơi dẻo",
      flexibilityEn: "Slightly flexible",
      heatResistanceVi: "Trung bình — tốt hơn PLA",
      heatResistanceEn: "Moderate — better than PLA",
      priceLevelVi: priceLevelLabelVi("PETG"),
      priceLevelEn: priceLevelLabelEn("PETG"),
      priceTier: priceTierFor("PETG"),
    },
  },
  "PETG-CF": {
    id: "PETG-CF",
    descriptionVi:
      "PETG-CF sợi carbon — cực cứng, kháng nhiệt và mặt nhám engineering; thích hợp khung và dụng cụ chịu lực.",
    descriptionEn:
      "Carbon-reinforced PETG delivers structural stiffness with premium matte hides—perfect for UAV frames and jigging.",
    summaryLineVi:
      "PETG-CF: Gia cố sợi carbon — rất cứng, chịu nhiệt tốt, bề mặt mờ cao cấp.",
    summaryLineEn:
      "PETG-CF: Carbon-reinforced — very stiff, better heat resistance, premium matte engineering look.",
    traitsVi: [
      "Gia cố sợi carbon",
      "Độ cứng rất cao",
      "Chịu nhiệt tốt",
      "Bề mặt mờ cao cấp",
    ],
    traitsEn: ["Carbon fibres", "High stiffness", "Heat-friendly", "Matte engineered finish"],
    useCasesVi: ["Khung drone", "Chi tiết kết cấu", "Dụng cụ kỹ thuật"],
    useCasesEn: ["Drone frames", "Bracing ribs", "Tooling fixtures"],
    bestForVi:
      "Chi tiết chịu lực & nhiệt — vật liệu composite cao cấp (mức giá theo gam cao hơn PETG, tương đương PLA trong bảng hiện tại).",
    bestForEn:
      "Structural loads and elevated temps—premium composite costing between PETG PLA tiers in today’s spreadsheet.",
    whenToChooseBulletsVi: [
      "Cần độ cứng và ổn định hình học cao (ít cong veo).",
      "Môi trường nóng hơn so với PLA/PETG thường.",
      "Ưu tiên phong cách engineering / mờ sang.",
    ],
    whenToChooseBulletsEn: [
      "Dimensional stability outweighs forgiving flex.",
      "Operating temps exceed standard PLA/PETG envelopes.",
      "You prefer an engineering matte finish.",
    ],
    comparison: {
      strengthVi: "Rất cao (độ cứng cấu trúc)",
      strengthEn: "Very high (structural stiffness)",
      flexibilityVi: "Rất cứng",
      flexibilityEn: "Highly rigid",
      heatResistanceVi: "Cao",
      heatResistanceEn: "High",
      priceLevelVi: priceLevelLabelVi("PETG-CF"),
      priceLevelEn: priceLevelLabelEn("PETG-CF"),
      priceTier: priceTierFor("PETG-CF"),
    },
  },
  TPU: {
    id: "TPU",
    descriptionVi:
      "TPU dẻo cao su, hấp thụ va đập — lý tưởng ốp lưng, gioăng và phụ kiện mềm.",
    descriptionEn:
      "TPU bends like elastomer blends—ideal damping layers, wearables-friendly bumpers, and compliant seals.",
    summaryLineVi:
      "TPU: Dẻo giống cao su, chống va đập — ốp điện thoại, gioăng, giảm chấn.",
    summaryLineEn:
      "TPU: Rubber-like flex, excellent impact damping — phone cases, gaskets, bumpers.",
    traitsVi: ["Dẻo", "Giống cao su", "Chống va đập tốt"],
    traitsEn: ["Flexible", "Rubber-like", "Impact damping"],
    useCasesVi: ["Ốp điện thoại", "Gioăng", "Giảm chấn rung", "Phụ kiện đeo được"],
    useCasesEn: ["Phone grips", "Gaskets", "Vibration mounts", "Wearables"],
    bestForVi:
      "Mọi ứng dụng cần đàn hồi — đây là lựa chọn cao cấp nhất về đơn giá gam trong bảng giá hiện tại.",
    bestForEn:
      "Every bendy elastomer scenario—currently the premium per-gram option in NA 3D SHOP filament roster.",
    whenToChooseBulletsVi: [
      "Cần uốn nén, va đập mà không vỡ.",
      "Gioăng, chân đệm, lớp bọc bảo vệ.",
      "Phụ kiện tiếp xúc da / cần cảm giác mềm.",
    ],
    whenToChooseBulletsEn: [
      "Repeated flex or compression cycles matter.",
      "Seals, bumpers, or dampers are in scope.",
      "Skin-contact accessories need softness.",
    ],
    comparison: {
      strengthVi: "Trung bình (theo hướng chống va đập, không cứng)",
      strengthEn: "Medium toughness (impact, not hardness)",
      flexibilityVi: "Rất dẻo",
      flexibilityEn: "Very flexible",
      heatResistanceVi: "Trung bình",
      heatResistanceEn: "Moderate",
      priceLevelVi: priceLevelLabelVi("TPU"),
      priceLevelEn: priceLevelLabelEn("TPU"),
      priceTier: priceTierFor("TPU"),
    },
  },
};