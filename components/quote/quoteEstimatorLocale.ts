import type { NaLocale } from "@/lib/quote-paths";

export type QuoteEstimatorStrings = {
  storageBusy: string;
  storageSavedFull: string;
  storagePartial: string;
  storageUnsynced: string;
  displayHeading: string;
  currencyAria: string;
  lengthAria: string;
  vndOption: string;
  usdOption: string;
  exchangeNotePrefix: string;
  exchangeNoteSuffix: string;
  freightLabel: string;
  freightAria: string;
  uploadOtherFile: string;
  uploadHintCompact: string;
  dropHere: string;
  dropChoose: string;
  uploadSub: string;
  previewSubSlicer: string;
  previewErrorTitle: string;
  previewErrorBody: string;
  previewMissingTitle: string;
  previewMissingBodyBefore: string;
  previewMissingCodeDev: string;
  previewMissingCodeDocker: string;
  previewMissingAfter: string;
  previewBetaLead: string;
  previewBetaRest: string;
  dimMetricSuffix: string;
  dimImperialSuffix: string;
  printTimeLabel: string;
  filamentLabel: string;
  weightLabel: string;
  weightPerPiece: string;
  bulkTitle: string;
  bulkLine510: string;
  bulkLine51200: string;
  bulkLine200: string;
  bulkLine500: string;
  bulkTipLead: string;
  bulkTipStudent: string;
  bulkTipMid: string;
  bulkTipMaterial: string;
  bulkTipChamber: string;
  bulkTipChamberName: string;
  bulkTipEnd: string;
  scaleHeading: string;
  scaleAria: string;
  audienceHeading: string;
  audienceGeneral: string;
  audienceStudent: string;
  audienceStudentNote: string;
  materialHeading: string;
  materialGuideLink: string;
  materialHintMobile: string;
  qtyHeading: string;
  qtyDecAria: string;
  qtyIncAria: string;
  priceTotalHeading: string;
  lineEquation: string;
  afterBulk: string;
  intlFreightLead: string;
  intlFreightTaxNote: string;
  intlFreightNeedFile: string;
  floorStudent: string;
  floorGeneral: string;
  studentDiscountLine: string;
  rfqCta: string;
  orderNow: string;
  orderSample: string;
  orderDisabledLead: string;
  orderNoteLead: string;
  orderNoteWeight: string;
  orderNoteFloor: string;
  orderEnabledHint: string;
  orderHomePerPartSuffix: string;
  orderHomeTotalLead: string;
  footerWorkshopLive: string;
  previewHeadlineGenerating: string;
  dimLabelXYZ: string;
  previewScaleCaptionBefore: string;
  previewScaleCaptionAfter: string;
  networkError: string;
  errorHttp: string;
};

const VI: QuoteEstimatorStrings = {
  storageBusy: "Đang xử lý…",
  storageSavedFull: "Đã lưu kho",
  storagePartial: "Lưu một phần",
  storageUnsynced: "Chưa đồng bộ kho",
  displayHeading: "Hiển thị",
  currencyAria: "Đơn vị tiền",
  lengthAria: "Đơn vị chiều dài",
  vndOption: "VNĐ",
  usdOption: "USD (ước tính)",
  exchangeNotePrefix: "Tỷ giá tham chiếu USD từ ",
  exchangeNoteSuffix: " — chỉ mang tính minh họa.",
  freightLabel: "Freight estimate",
  freightAria: "Khu vực nhận hàng quốc tế",
  uploadOtherFile: "Báo giá mẫu khác",
  uploadHintCompact: 'Kéo thả STL vào khung trên hoặc bấm "Báo giá mẫu khác" · tối đa 50 MB',
  dropHere: "Thả file STL vào đây",
  dropChoose: "Kéo thả file STL hoặc bấm để chọn",
  uploadSub: "Tối đa 50 MB · chỉ định dạng .stl · hệ thống sẽ tự slice và ước tính giá",
  previewSubSlicer: "Đang lấy metadata slicer và dựng ảnh xem trước…",
  previewErrorTitle: "Ảnh xem trước chưa sẵn sàng.",
  previewErrorBody:
    "Ảnh không hiển thị được hoặc máy chủ chưa cấu hình bộ dựng thumbnail. Báo giá bên vẫn dùng metadata đã nhận.",
  previewMissingTitle: "Chưa có ảnh xem trước 3D",
  previewMissingBodyBefore:
    "Ảnh được tạo bởi dịch vụ thumb-service (FastAPI), không phải slicer. Khi chạy next dev trên máy, đặt ",
  previewMissingCodeDev: "STL2THUMB_SERVICE_URL=http://127.0.0.1:8887",
  previewMissingCodeDocker: "http://thumb-service:8887",
  previewMissingAfter: " nếu API thumbnail chạy cổng 8887; trong Docker Compose dùng ",
  previewBetaLead: "Xem trước (beta):",
  previewBetaRest:
    " chất lượng hình ảnh có thể chưa tốt; đây chỉ là minh họa từ geometry STL, không phải thành phẩm in thực tế.",
  dimMetricSuffix: " · mm",
  dimImperialSuffix: " · in",
  printTimeLabel: "Thời gian in (ước tính)",
  filamentLabel: "Độ dài nhựa đùn (1 mẫu)",
  weightLabel: "Khối lượng ước tính (1 mẫu)",
  weightPerPiece: " g/mẫu",
  bulkTitle: "Giảm giá số lượng (B2B)",
  bulkLine510: "10–50 mắt nhắt: −5%",
  bulkLine51200: "51–200 mắt nhắt: −15%",
  bulkLine200: "Trên 200 mắt nhắt: liên hệ báo giá chính thức",
  bulkLine500: "Trên 500 mắt nhắt: RFQ + tài liệu kỹ thuật",
  bulkTipLead: "Mẹo nhanh: chọn ",
  bulkTipStudent: "Sinh viên",
  bulkTipMid: " để xem giá ưu đãi; chọn nhựa kỹ thuật như ",
  bulkTipMaterial: "PETG-CF",
  bulkTipChamber: " khi cần chi tiết chịu lực/nhiệt (",
  bulkTipChamberName: "máy buồng kín",
  bulkTipEnd: ").",
  scaleHeading: "Tỷ lệ mô hình (hộp giới hạn)",
  scaleAria: "Tỷ lệ mô hình",
  audienceHeading: "Đối tượng",
  audienceGeneral: "Người dùng thường",
  audienceStudent: "Sinh viên",
  audienceStudentNote:
    "Giá ưu đãi sinh viên (trong đợt khuyến mãi) có thể chưa áp dụng theo ngày.",
  materialHeading: "Loại nhựa",
  materialGuideLink: "Hướng dẫn chi tiết",
  materialHintMobile:
    "Chạm giữ chip nhựa hoặc bấm biểu tượng trợ giúp bên cạnh để xem gợi ý nhanh.",
  qtyHeading: "Số lượng",
  qtyDecAria: "Giảm số lượng",
  qtyIncAria: "Tăng số lượng",
  priceTotalHeading: "Ước tính giá in (Tổng)",
  lineEquation: " × ",
  afterBulk: "Sau giảm số lượng ({tier}):",
  intlFreightLead: "Phí vận chuyển quốc tế (ước tính, không gồm thuế HQ):",
  intlFreightTaxNote: "≈ ",
  intlFreightNeedFile: "Nhập file để ước tính khối lượng cho phí quốc tế.",
  floorStudent: "Giá đã được điều chỉnh về mức tối thiểu 30.000đ cho sinh viên.",
  floorGeneral: "Giá đã được điều chỉnh về mức tối thiểu 50.000đ cho người dùng thường.",
  studentDiscountLine:
    "Giá 1 mẫu: áp dụng {grams} g theo giá sinh viên trong đợt khuyến mãi (trên 1 mẫu).",
  rfqCta: "Gửi RFQ (trên 500 mắt nhắt)",
  orderNow: "Đặt in ngay",
  orderSample: "Đặt in mẫu này",
  orderDisabledLead: "Đặt hàng trực tuyến đang tắt — vui lòng liên hệ:",
  orderNoteLead: "Ghi chú báo giá: số lượng ",
  orderNoteWeight: ", khối lượng tổng ~",
  orderNoteFloor: ", tổng thanh toán tối thiểu ",
  orderEnabledHint:
    "Mở form đặt hàng trên trang chủ; tham khảo tổng khối lượng ~",
  orderHomePerPartSuffix: "g/mẫu ×",
  orderHomeTotalLead: "tổng tiền ước tính",
  footerWorkshopLive: "Xưởng đang hoạt động",
  previewHeadlineGenerating: "Đang dựng xem trước 3D…",
  dimLabelXYZ: "Kích thước (XYZ)",
  previewScaleCaptionBefore: "Ảnh là file gốc đã tải; giá và kích thước bên dưới theo tỷ lệ ",
  previewScaleCaptionAfter: ".",
  networkError: "Lỗi mạng",
  errorHttp: "Lỗi ",
};

const EN: QuoteEstimatorStrings = {
  storageBusy: "Processing…",
  storageSavedFull: "Saved to storage",
  storagePartial: "Partially saved",
  storageUnsynced: "Not synced to storage",
  displayHeading: "Display",
  currencyAria: "Currency",
  lengthAria: "Length units",
  vndOption: "VND",
  usdOption: "USD (estimate)",
  exchangeNotePrefix: "Reference USD rate from ",
  exchangeNoteSuffix: " — illustrative only.",
  freightLabel: "Freight estimate",
  freightAria: "Shipping region",
  uploadOtherFile: "Quote another part",
  uploadHintCompact: 'Drag & drop STL on the strip above or use “Quote another part” · max 50 MB',
  dropHere: "Drop your STL here",
  dropChoose: "Drag & drop STL or click to browse",
  uploadSub: "Max 50 MB · .stl only · we slice and estimate instantly",
  previewSubSlicer: "Fetching slicer metadata and building preview…",
  previewErrorTitle: "Preview not available yet.",
  previewErrorBody:
    "The image could not render or thumbnail services are misconfigured. Pricing below still uses the received metadata.",
  previewMissingTitle: "No 3D preview yet",
  previewMissingBodyBefore:
    "Thumbnails come from thumb-service (FastAPI), not the slicer. For local next dev set ",
  previewMissingCodeDev: "STL2THUMB_SERVICE_URL=http://127.0.0.1:8887",
  previewMissingCodeDocker: "http://thumb-service:8887",
  previewMissingAfter: " when the API runs locally; inside Docker Compose use ",
  previewBetaLead: "Preview (beta):",
  previewBetaRest:
    " image quality may be rough — this illustrates STL geometry only, not final print quality.",
  dimMetricSuffix: " · mm",
  dimImperialSuffix: " · in",
  printTimeLabel: "Est. print time",
  filamentLabel: "Filament extruded (1 part)",
  weightLabel: "Est. weight (1 part)",
  weightPerPiece: " g/part",
  bulkTitle: "Volume pricing (B2B)",
  bulkLine510: "10–50 pcs: −5%",
  bulkLine51200: "51–200 pcs: −15%",
  bulkLine200: "Over 200 pcs: contact us for a formal quotation",
  bulkLine500: "Over 500 pcs: RFQ + engineering package",
  bulkTipLead: "Tip: enable ",
  bulkTipStudent: "Student",
  bulkTipMid: " pricing where applicable and pick engineered materials like ",
  bulkTipMaterial: "PETG-CF",
  bulkTipChamber: " when you need stiffness/heat resistance (",
  bulkTipChamberName: "enclosed-chamber printers",
  bulkTipEnd: ").",
  scaleHeading: "Uniform scale (bounding box)",
  scaleAria: "Model scale",
  audienceHeading: "Pricing tier",
  audienceGeneral: "Standard",
  audienceStudent: "Student",
  audienceStudentNote: "Student promotional rates may vary by campaign date.",
  materialHeading: "Material",
  materialGuideLink: "Material guide",
  materialHintMobile: "Long-press a material chip or tap the help icon for a quick summary.",
  qtyHeading: "Quantity",
  qtyDecAria: "Decrease quantity",
  qtyIncAria: "Increase quantity",
  priceTotalHeading: "Estimated total",
  lineEquation: " × ",
  afterBulk: "After volume discount ({tier}):",
  intlFreightLead: "International freight (estimate, excludes duties/taxes):",
  intlFreightTaxNote: "≈ ",
  intlFreightNeedFile: "Upload a file to estimate weight for international freight.",
  floorStudent: "Minimum order adjusted to ₫30,000 for student tiers.",
  floorGeneral: "Minimum order adjusted to ₫50,000 for standard tiers.",
  studentDiscountLine:
    "Unit price reflects {grams} g at the promotional student rate (per part).",
  rfqCta: "Request RFQ (500+ pcs)",
  orderNow: "Order now",
  orderSample: "Order this part",
  orderDisabledLead: "Online checkout is paused — reach us via:",
  orderNoteLead: "Quote notes: qty ",
  orderNoteWeight: ", total weight ~",
  orderNoteFloor: "; minimum payable ",
  orderEnabledHint:
    "Open the order form from the homepage; total weight reference ~",
  orderHomePerPartSuffix: "g/pc ×",
  orderHomeTotalLead: "estimated total",
  footerWorkshopLive: "Workshop online",
  previewHeadlineGenerating: "Building 3D preview…",
  dimLabelXYZ: "Bounding box (XYZ)",
  previewScaleCaptionBefore: "Thumbnail shows the uploaded file; pricing and XYZ below reflect scale ",
  previewScaleCaptionAfter: ".",
  networkError: "Network error",
  errorHttp: "Error ",
};

export function quoteEstimatorStrings(locale: NaLocale): QuoteEstimatorStrings {
  return locale === "en" ? EN : VI;
}

export function quoteQtyRangeHint(locale: NaLocale, min: number, max: number): string {
  return locale === "en"
    ? `Min ${min} · max ${max}`
    : `Tối thiểu ${min} · tối đa ${max}`;
}
