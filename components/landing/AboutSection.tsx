import Image from "next/image";

const MACHINE_GROUPS = [
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
];

type AboutSectionProps = {
  images?: { src: string; alt: string }[];
};

export function AboutSection({ images = [] }: AboutSectionProps) {
  return (
    <section className="py-16">
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Quy mô xưởng
      </h2>
      <p className="mt-4 max-w-3xl text-zinc-600 dark:text-zinc-300 lg:max-w-4xl lg:text-lg lg:leading-relaxed">
        Xưởng được trang bị nhiều máy in 3D với kích thước lớn, đáp ứng nhu cầu
        từ cá nhân đến sản xuất nhỏ.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MACHINE_GROUPS.map((group) => (
          <article
            key={group.title}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {group.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {group.description}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-8">
        {images.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {images.map((image) => (
              <article
                key={image.src}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={1200}
                  height={900}
                  className="h-64 w-full object-cover"
                />
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Thêm 2 ảnh vào thư mục <code className="font-mono text-xs">public/printers</code> để hiển thị tại đây.
          </p>
        )}
      </div>
    </section>
  );
}
