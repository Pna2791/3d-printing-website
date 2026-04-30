export default function QuotePage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-3xl font-semibold tracking-tight">Báo giá file in 3D</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-300">
          Gửi file STL/STEP qua Zalo hoặc email để nhận báo giá nhanh theo vật
          liệu, kích thước và thời gian in.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="tel:0848939059"
            className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Liên hệ Zalo: 08489.39059
          </a>
          <p className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold dark:border-zinc-700">
            Hoặc gửi email theo thông tin ở mục Liên hệ trên trang chủ.
          </p>
        </div>
      </div>
    </main>
  );
}
