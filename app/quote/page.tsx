import { QuoteEstimatorClient } from "@/components/quote/QuoteEstimatorClient";

export default function QuotePage() {
  return (
    <main className="min-h-screen bg-white px-4 py-12 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 border-b border-zinc-200 pb-8 dark:border-zinc-800">
          <p className="text-sm font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Na 3D
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Báo giá file in 3D
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
            Tải file STL để hệ thống slice và ước tính thời gian, lượng nhựa và giá theo bảng giá
            PLA/PETG (người thường / sinh viên).
          </p>
        </header>

        <QuoteEstimatorClient />
      </div>
    </main>
  );
}
