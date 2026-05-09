/**
 * Central copy for server- and client-rendered UI (no runtime locale detection — pass `locale` from the route).
 */
export type AppLocale = "vi" | "en";

export const dictionary = {
  vi: {
    home: {
      showcaseAltPrefix: "Mẫu in 3D giá rẻ HCM",
      printerAltPrefix: "Máy in 3D",
      hero: {
        badge: "Ship toàn quốc — Ưu đãi lớn cho sinh viên",
        title: "In 3D giá rẻ HCM (Thủ Đức) — NA 3D SHOP giao hàng COD toàn quốc",
        leadBefore: "Xưởng tại",
        leadHighlight: "Bcons Miền Đông, Dĩ An, Bình Dương",
        leadAfter:
          "— gần Làng Đại Học Quốc Gia TP.HCM; giá minh bạch, ưu đãi cho sinh viên và khách nội thành.",
        promoLive: "Xưởng đang hoạt động — Nhận file in ngay hôm nay!",
        openingCardTitle: "Khai trương từ 01/05 - 10/05",
        openingCardFrom: "Giá từ 400đ/g",
        petgStudentSuffix: "đ/gram cho sinh viên",
        ctaQuote: "Báo giá in 3D lấy liền (HCM)",
        ctaPricing: "Xem bảng giá",
        ctaStlTool: "Công cụ báo giá file STL",
        logoAlt: "Logo NA 3D SHOP — in 3D giá rẻ, ship toàn quốc",
        stickerLine1: "Grand Opening",
        stickerLine2: "— Giảm giá sinh viên",
      },
      showcase: {
        title: "Sản phẩm đã in",
        scrollLeft: "Cuộn sang trái",
        scrollRight: "Cuộn sang phải",
        dialogLabel: "Xem ảnh sản phẩm đã in",
        enlargeTemplate: "Xem ảnh lớn: {alt}",
        close: "Đóng",
      },
      enclosed: {
        kicker: "Cập nhật công nghệ",
        title: "Máy in buồng kín — in ABS & nhựa kỹ thuật chuẩn xưởng",
        body:
          "Đầu tư máy in buồng kín hiện đại, cam kết chất lượng in ABS và nhựa kỹ thuật không cong vênh, độ bền cao. Buồng kín giúp kiểm soát nhiệt và luồng khí tốt hơn — lý tưởng cho chi tiết chịu lực, nhiệt và môi trường khắc nghiệt hơn so với in mở thông thường.",
        cta: "Liên hệ để được tư vấn vật liệu ABS / PETG-CF và lộ trình in phù hợp từng đơn hàng.",
      },
      globalOrders: {
        kicker: "Đối tác & khách quốc tế",
        title: "Vì sao chọn xưởng NA 3D SHOP cho đơn global?",
        bullets: [
          {
            lead: "In buồng kín",
            rest: "— tối ưu nhựa kỹ thuật & ABS cho chi tiết công trình/bản mẫu.",
          },
          {
            lead: "QC ",
            rest: "nghiêm ngặt theo đơn, rõ ràng về chỉnh sửa & chấp nhận khuyết tật.",
          },
          {
            lead: "Từ prototype nhanh",
            rest: "đến sản xuất nhỏ với quy mô máy đa kích thước.",
          },
        ],
      },
      about: {
        title: "Quy mô xưởng",
        intro: "Xưởng được trang bị nhiều máy in 3D với kích thước lớn, đáp ứng nhu cầu từ cá nhân đến sản xuất nhỏ.",
        printerPlaceholder:
          'Thêm 2 ảnh vào thư mục public/printers để hiển thị tại đây.',
        machineGroups: [
          {
            title: "6 máy: 420x420x480",
            description: "Phù hợp in chi tiết lớn, mô hình kiến trúc và sản phẩm kỹ thuật.",
          },
          {
            title: "2 máy: 300x300x340",
            description: "Cân bằng tốc độ và độ ổn định cho đơn hàng số lượng vừa.",
          },
          {
            title: "4 máy: 235x235x265",
            description: "Tối ưu chi phí cho mẫu thử, phụ kiện, và mô hình học tập.",
          },
        ],
      },
      workshop: {
        kicker: "Ghé xưởng",
        titleMiddle: "Địa điểm xưởng —",
        subtitle:
          "Thuận đường cho sinh viên Làng Đại Học và khách Dĩ An / TP.HCM — xem chỉ đường trên Google Maps.",
        directions: "Chỉ đường",
        openMaps: "Mở Google Maps",
        mapIframeLead: "Bản đồ Google —",
        mapIframeAt: "tại",
      },
      contact: {
        title: "Liên hệ",
        phoneDisplay: "08489.39059 (Zalo)",
      },
      queryError: {
        printers: "Không tải được tình trạng máy in",
        materials: "Không tải được bảng giá nhanh",
        workshop: "Không tải được phần liên hệ",
      },
      order: {
        title: "Đặt in",
        subtitle:
          "Từ trang báo giá, bạn có thể nhảy tới đây để gửi đơn khi đặt in trực tuyến được bật.",
        disabledLead: "Đặt hàng qua web đang tắt — vui lòng liên hệ:",
        disabledHint: "Hoặc email trong mục Liên hệ phía trên.",
      },
      pricingPreview: {
        title: "Bảng giá nhanh (minh họa)",
        subtitle: "Tính tiếp các loại nhựa phổ biến với ví dụ 100g và mức sinh viên (nếu đang trong đợt ưu đãi)",
        promoBadge: "Ưu đãi sinh viên",
        columnMaterial: "Vật liệu",
        columnRegular: "Giá thường",
        columnStudent: "Giá sinh viên",
        studentBadge: "Sinh viên",
        beforeDiscount: "Trước giảm",
        afterDiscount: "Sau giảm",
        viewFull: "Xem bảng giá đầy đủ",
        viewDetail: "Xem bảng giá chi tiết",
        footnote:
          "Ưu đãi áp dụng cho tất cả mọi người. Giá sinh viên chỉ áp dụng cho {kg}KG/tháng, phần vượt mức sẽ tính theo giá thường.",
        footnoteNoServerData:
          " Dữ liệu Supabase hiện chưa có vật liệu, nhưng giá đã theo cấu hình mới.",
        needLogin: "Cần đăng nhập để gửi đơn",
        noData: "Chưa có dữ liệu giá từ máy chủ — vui lòng thử lại sau.",
      },
      grandOpeningBar: {
        aria: "Thông báo khai trương",
        lineStart: "CHÀO MỪNG KHAI TRƯƠNG",
        lineEnd: "— Ưu đãi đặc biệt đến hết 10/05!",
        lastDay: "Đang trong ngày cuối ưu đãi!",
        remaining: "Còn lại",
      },
    },
    footer: {
      quoteLabel: "Báo giá in 3D",
    },
    header: {
      quoteNav: "Báo giá",
      ariaHome: "Về trang chủ",
      ariaLangTogglePrefix: "Đổi ngôn ngữ",
    },
    materials: {
      back: "Về trang chủ",
      kicker: "Hướng dẫn vật liệu",
      title: "Chọn loại nhựa phù hợp",
      intro:
        "Bảng so sánh nhanh các loại nhựa NA 3D SHOP đang phục vụ — ship COD toàn quốc, ưu đãi sinh viên. Giá theo gam trên trang báo giá luôn khớp bảng giá hiện hành; ABS & nhựa kỹ thuật in buồng kín theo từng đơn.",
      linkToViQuote: "Đi tới báo giá STL →",
      linkToEnQuote: "English quote tool →",
      linkAlternateMaterialsPage: "Bản tiếng Anh — English materials →",
      compareTitle: "Bảng so sánh",
      compareHint: "Mô tả mang tính tham khảo thực tế in FDM; từng máy và thông số có thể ảnh hưởng nhẹ.",
      thMaterial: "Loại nhựa",
      thStrength: "Độ cứng / bền",
      thFlex: "Độ dẻo",
      thHeat: "Chịu nhiệt",
      thPrice: "Mức giá (theo bảng)",
      detailTitle: "Chi tiết từng loại",
      useCasesLabel: "Gợi ý ứng dụng:",
      bestForKicker: "Phù hợp nhất cho",
      whenChoose: "Khi nào nên chọn?",
    },
  },
  en: {
    home: {
      showcaseAltPrefix: "3D print sample — NA 3D SHOP Vietnam",
      printerAltPrefix: "3D printer",
      hero: {
        badge: "Nationwide COD — student-friendly pricing",
        title: "Affordable 3D printing in HCMC (Thu Duc) — NA 3D SHOP",
        leadBefore: "Workshop at",
        leadHighlight: "Bcons Miền Đông, Di An, Binh Duong",
        leadAfter:
          "— near Vietnam National University village; transparent pricing for students and local pickups.",
        promoLive: "Workshop accepting files — same-day slicing when capacity allows!",
        openingCardTitle: "Grand opening 01/05 - 10/05",
        openingCardFrom: "From 400 ₫/g",
        petgStudentSuffix: "₫/g for students",
        ctaQuote: "Instant quote (HCMC)",
        ctaPricing: "View pricing",
        ctaStlTool: "STL quote calculator",
        logoAlt: "NA 3D SHOP — affordable 3D printing, nationwide shipping",
        stickerLine1: "Grand Opening",
        stickerLine2: "— Student deals",
      },
      showcase: {
        title: "Recent prints",
        scrollLeft: "Scroll left",
        scrollRight: "Scroll right",
        dialogLabel: "Print gallery preview",
        enlargeTemplate: "Open large image: {alt}",
        close: "Close",
      },
      enclosed: {
        kicker: "Technology",
        title: "Enclosed-chamber printers — ABS & engineered materials",
        body:
          "Industrial enclosed printers control heat and airflow to reduce warp on ABS and technical filaments — ideal when you need toughness, temperature resistance, or engineering-grade cosmetics.",
        cta: "Ask us about ABS / PETG-CF and the right workflow for each order.",
      },
      globalOrders: {
        kicker: "Partners & overseas buyers",
        title: "Why NA 3D SHOP for global orders?",
        bullets: [
          {
            lead: "Enclosed chamber",
            rest: " printing for engineered materials & ABS-heavy builds.",
          },
          {
            lead: "QC",
            rest: " per batch with crisp communication on rework and acceptance.",
          },
          {
            lead: "Prototype to pilot runs",
            rest: " with multiple machine sizes.",
          },
        ],
      },
      about: {
        title: "Workshop scale",
        intro:
          "Multiple large-format printers cover everything from hobby parts to boutique production batches.",
        printerPlaceholder:
          "Add printer photos under public/printers (up to two) to display here.",
        machineGroups: [
          {
            title: "Six printers · 420×420×480 mm",
            description: "Architectural visuals, oversized props, and engineering shells.",
          },
          {
            title: "Two printers · 300×300×340 mm",
            description: "Balanced throughput for mid-size production runs.",
          },
          {
            title: "Four printers · 235×235×265 mm",
            description: "Cost-efficient student samples, gadgets, and test fits.",
          },
        ],
      },
      workshop: {
        kicker: "Visit",
        titleMiddle: "Workshop address —",
        subtitle: "Easy access for university village students and Binh Duong/HCM commuters — directions on Google Maps.",
        directions: "Directions",
        openMaps: "Open Google Maps",
        mapIframeLead: "Google Map —",
        mapIframeAt: "at",
      },
      contact: {
        title: "Contact",
        phoneDisplay: "08489.39059 (Zalo)",
      },
      queryError: {
        printers: "Printer status could not be loaded",
        materials: "Pricing snapshot could not be loaded",
        workshop: "Contact block could not be loaded",
      },
      order: {
        title: "Place an order",
        subtitle: "Jump here from the quote page when authenticated web ordering is enabled.",
        disabledLead: "Web checkout is paused — reach us via:",
        disabledHint: "Or email from the Contact section above.",
      },
      pricingPreview: {
        title: "Quick pricing (sample math)",
        subtitle: "100 g example parts with student promo when the campaign window is active",
        promoBadge: "Student promo",
        columnMaterial: "Material",
        columnRegular: "Standard",
        columnStudent: "Student",
        studentBadge: "Student",
        beforeDiscount: "Before discount",
        afterDiscount: "After discount",
        viewFull: "See full breakdown",
        viewDetail: "Open full pricing sheet",
        footnote:
          "Promotions apply broadly. Student-gram allowances cover {kg} kg/month; grams beyond that bill at the standard rate.",
        footnoteNoServerData: " Supabase has no material rows yet — pricing still reflects the configured rules.",
        needLogin: "Sign in required to submit",
        noData: "Pricing unavailable — retry shortly.",
      },
      grandOpeningBar: {
        aria: "Grand opening announcement",
        lineStart: "WELCOME",
        lineEnd: "— special offers until 10/05!",
        lastDay: "Final day of the promo window!",
        remaining: "Time left",
      },
    },
    footer: {
      quoteLabel: "3D printing quote",
    },
    header: {
      quoteNav: "Quote",
      ariaHome: "Go to homepage",
      ariaLangTogglePrefix: "Switch language",
    },
    materials: {
      back: "Back to homepage",
      kicker: "Materials",
      title: "Choose the right filament",
      intro:
        "Side-by-side look at NA 3D SHOP filament lines (FDM reality may vary slightly by tuning). Prices on the STL quote match the live table.",
      linkToViQuote: "Vietnamese quote page →",
      linkToEnQuote: "English quote tool →",
      linkAlternateMaterialsPage: "Vietnamese material guide →",
      compareTitle: "Comparison",
      compareHint: "Rule-of-thumb guidance for FDM — actual results depend on printer profiles.",
      thMaterial: "Material",
      thStrength: "Stiffness / toughness",
      thFlex: "Flex",
      thHeat: "Heat",
      thPrice: "Price tier",
      detailTitle: "Deep dive",
      useCasesLabel: "Suggested uses:",
      bestForKicker: "Best suited for",
      whenChoose: "When to pick it?",
    },
  },
} as const;

export type Dictionary = (typeof dictionary)[AppLocale];

export function getDictionary(locale: AppLocale): Dictionary {
  return dictionary[locale];
}
