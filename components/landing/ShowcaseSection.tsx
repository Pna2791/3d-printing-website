import Image from "next/image";

const SHOWCASE_IMAGES = [
  { src: "/sample1.jpg", alt: "Mẫu in 3D chi tiết cơ khí" },
  { src: "/sample2.jpg", alt: "Mẫu in 3D màu cho sản phẩm trưng bày" },
  { src: "/sample3.jpg", alt: "Máy in 3D đang hoạt động tại xưởng" },
  { src: "/sample4.jpg", alt: "Sản phẩm in 3D hoàn thiện" },
];

export function ShowcaseSection() {
  return (
    <section className="py-16">
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Sản phẩm đã in
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SHOWCASE_IMAGES.map((image) => (
          <article
            key={image.src}
            className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={1200}
              height={900}
              className="h-64 w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </article>
        ))}
      </div>
    </section>
  );
}
