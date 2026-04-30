import Image from "next/image";

type HeroSectionProps = {
  onOpenPricing: () => void;
};

export function HeroSection({ onOpenPricing }: HeroSectionProps) {
  return (
    <section className="grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
          Xưởng in 3D tại khu vực Thủ Đức
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Dịch vụ in 3D giá tốt tại Làng Đại Học
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">
          In nhanh - Giá minh bạch - Hỗ trợ tận tình
        </p>

        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-900/50 dark:bg-emerald-900/20">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            Khai trương từ 01/05 - 10/05
          </p>
          <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">
            Giá từ 400đ/g
          </p>
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            300đ/g cho sinh viên
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onOpenPricing}
            className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Xem bảng giá
          </button>
          <a
            href="/quote"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Báo giá file in
          </a>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <Image
          src="/logo-na_3d.png"
          alt="Mẫu sản phẩm in 3D tại xưởng"
          width={1200}
          height={900}
          className="h-full w-full object-cover"
          priority
        />
      </div>
    </section>
  );
}
