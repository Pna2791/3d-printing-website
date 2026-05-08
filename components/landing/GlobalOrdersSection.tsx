/**
 * B2B / international trust block (Vietnamese landing).
 */
export function GlobalOrdersSection() {
  return (
    <section
      aria-labelledby="global-orders-heading"
      className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-950 to-emerald-950/40 p-8 text-zinc-100 shadow-sm dark:border-zinc-800 sm:p-10"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90">
        Đối tác &amp; khách quốc tế
      </p>
      <h2 id="global-orders-heading" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        Vì sao chọn xưởng NA 3D SHOP cho đơn global?
      </h2>
      <ul className="mt-5 space-y-3 text-sm leading-relaxed text-zinc-300">
        <li>
          <span className="font-semibold text-emerald-400">In buồng kín</span> — tối ưu nhựa kỹ thuật &amp; ABS cho
          chi tiết công trình/bản mẫu.
        </li>
        <li>
          <span className="font-semibold text-emerald-400">QC </span>nghiêm ngặt theo đơn, rõ ràng về chỉnh sửa &amp;
          chấp nhận khuyết tật.
        </li>
        <li>
          <span className="font-semibold text-emerald-400">Từ prototype nhanh</span> đến sản xuất nhỏ với quy mô máy
          đa kích thước.
        </li>
      </ul>
    </section>
  );
}
