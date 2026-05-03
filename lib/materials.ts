import { PRICING_RULES, type SupportedMaterial } from "@/lib/pricing";

/** Relative price tier (1 = lowest normal rate in shop) for guide / comparison copy. */
export type MaterialPriceTier = 1 | 2 | 3 | 4;

export type MaterialComparisonRow = {
  strengthVi: string;
  flexibilityVi: string;
  heatResistanceVi: string;
  priceLevelVi: string;
  priceTier: MaterialPriceTier;
};

export type MaterialGuideEntry = {
  id: SupportedMaterial;
  /** Một dòng cho tooltip / hover (tiếng Việt). */
  summaryLineVi: string;
  /** Đặc điểm chính (ngắn). */
  traitsVi: string[];
  /** Ứng dụng gợi ý. */
  useCasesVi: string[];
  /** Gợi ý nổi bật (Emerald trên UI). */
  bestForVi: string;
  /** Gạch đầu dòng “khi nào nên chọn”. */
  whenToChooseBulletsVi: string[];
  comparison: MaterialComparisonRow;
};

function priceTierFor(material: SupportedMaterial): MaterialPriceTier {
  const n = PRICING_RULES[material].normalVndPerGram;
  if (n <= 400) return 1;
  if (n <= 500) return 2;
  if (n <= 600) return 3;
  return 4;
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

export const MATERIAL_GUIDE: Record<SupportedMaterial, MaterialGuideEntry> = {
  PLA: {
    id: "PLA",
    summaryLineVi:
      "PLA: Dễ in, bề mặt đẹp, nhiều màu — hơi giòn, phù hợp mô hình trang trí & prototype.",
    traitsVi: ["Dễ in", "Thẩm mỹ tốt", "Nhiều màu", "Tương đối giòn"],
    useCasesVi: ["Mô hình trang trí", "Prototype nhanh", "Đồ chơi bàn làm việc"],
    bestForVi: "Mô hình trang trí, prototype và đồ trưng bày — dễ in, chi phí nhựa theo gam ở mức trung bình.",
    whenToChooseBulletsVi: [
      "Bạn ưu tiên độ đẹp bề mặt và in thử ý tưởng nhanh.",
      "Chi tiết không chịu tải lớn hoặc nhiệt cao.",
      "Bạn muốn nhiều lựa chọn màu sắc.",
    ],
    comparison: {
      strengthVi: "Trung bình (dễ gãy khi va đập mạnh)",
      flexibilityVi: "Cứng",
      heatResistanceVi: "Thấp — tránh môi trường nóng lâu",
      priceLevelVi: priceLevelLabelVi("PLA"),
      priceTier: priceTierFor("PLA"),
    },
  },
  PETG: {
    id: "PETG",
    summaryLineVi:
      "PETG: Bền, chịu ẩm tốt, hơi dẻo — phù hợp linh kiện cơ khí & dùng ngoài trời.",
    traitsVi: ["Bền", "Chống thấm nước tốt", "Hơi dẻo so với PLA"],
    useCasesVi: ["Chi tiết chức năng", "Linh kiện cơ khí", "Ứng dụng ngoài trời"],
    bestForVi: "Linh kiện vừa bền vừa tiết kiệm — mức giá theo gam thấp nhất trong các loại đang phục vụ.",
    whenToChooseBulletsVi: [
      "Cần độ bền va đập tốt hơn PLA và ít giòn hơn.",
      "Tiếp xúc ẩm / môi trường ngoài trời nhẹ.",
      "Ưu tiên chi phí nhựa hợp lý cho in chức năng.",
    ],
    comparison: {
      strengthVi: "Cao hơn PLA",
      flexibilityVi: "Hơi dẻo",
      heatResistanceVi: "Trung bình — tốt hơn PLA",
      priceLevelVi: priceLevelLabelVi("PETG"),
      priceTier: priceTierFor("PETG"),
    },
  },
  "PETG-CF": {
    id: "PETG-CF",
    summaryLineVi:
      "PETG-CF: Gia cố sợi carbon — rất cứng, chịu nhiệt tốt, bề mặt mờ cao cấp.",
    traitsVi: [
      "Gia cố sợi carbon",
      "Độ cứng rất cao",
      "Chịu nhiệt tốt",
      "Bề mặt mờ cao cấp",
    ],
    useCasesVi: ["Khung drone", "Chi tiết kết cấu", "Dụng cụ kỹ thuật"],
    bestForVi:
      "Chi tiết chịu lực & nhiệt — vật liệu composite cao cấp (mức giá theo gam cao hơn PETG, tương đương PLA trong bảng hiện tại).",
    whenToChooseBulletsVi: [
      "Cần độ cứng và ổn định hình học cao (ít cong veo).",
      "Môi trường nóng hơn so với PLA/PETG thường.",
      "Ưu tiên phong cách engineering / mờ sang.",
    ],
    comparison: {
      strengthVi: "Rất cao (độ cứng cấu trúc)",
      flexibilityVi: "Rất cứng",
      heatResistanceVi: "Cao",
      priceLevelVi: priceLevelLabelVi("PETG-CF"),
      priceTier: priceTierFor("PETG-CF"),
    },
  },
  TPU: {
    id: "TPU",
    summaryLineVi:
      "TPU: Dẻo giống cao su, chống va đập — ốp điện thoại, gioăng, giảm chấn.",
    traitsVi: ["Dẻo", "Giống cao su", "Chống va đập tốt"],
    useCasesVi: ["Ốp điện thoại", "Gioăng", "Giảm chấn rung", "Phụ kiện đeo được"],
    bestForVi:
      "Mọi ứng dụng cần đàn hồi — đây là lựa chọn cao cấp nhất về đơn giá gam trong bảng giá hiện tại.",
    whenToChooseBulletsVi: [
      "Cần uốn nén, va đập mà không vỡ.",
      "Gioăng, chân đệm, lớp bọc bảo vệ.",
      "Phụ kiện tiếp xúc da / cần cảm giác mềm.",
    ],
    comparison: {
      strengthVi: "Trung bình (theo hướng chống va đập, không cứng)",
      flexibilityVi: "Rất dẻo",
      heatResistanceVi: "Trung bình",
      priceLevelVi: priceLevelLabelVi("TPU"),
      priceTier: priceTierFor("TPU"),
    },
  },
};