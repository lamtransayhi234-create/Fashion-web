import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  Bookmark,
  Calendar,
  Camera,
  Clock,
  Coffee,
  Compass,
  Feather,
  Heart,
  Mail,
  Quote,
  Sparkles,
  Star,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { products as ALL_PRODUCTS, providers } from "@/lib/data/products"

import { ArticleNav } from "./_components/article-nav"

function getProduct(id: string) {
  const p = ALL_PRODUCTS.find((x) => x.id === id)
  if (!p) throw new Error(`Product ${id} not found`)
  const provider = providers.find((v) => v.id === p.providerId)!
  return { ...p, provider }
}

function Eyebrow({ label, light = false }: { label: string; light?: boolean }) {
  const stroke = light ? "bg-[oklch(0.78_0.04_70)]" : "bg-[oklch(0.6_0.062_60)]"
  const text = light
    ? "text-[oklch(0.78_0.04_70)]"
    : "text-[oklch(0.5_0.024_60)]"
  return (
    <div className="inline-flex items-center gap-3">
      <span className={`h-px w-8 lg:w-10 ${stroke}`} />
      <span
        className={`text-[10px] font-semibold tracking-[0.28em] uppercase lg:text-[11px] lg:tracking-[0.32em] ${text}`}
      >
        {label}
      </span>
    </div>
  )
}

function ByLine({
  author,
  date,
  readTime,
  light = false,
}: {
  author: string
  date: string
  readTime: string
  light?: boolean
}) {
  const muted = light
    ? "text-[oklch(0.78_0.018_70)]"
    : "text-[oklch(0.5_0.024_60)]"
  const sep = light
    ? "bg-[oklch(0.78_0.04_70/0.5)]"
    : "bg-[oklch(0.78_0.04_70)]"
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold tracking-[0.22em] uppercase ${muted}`}
    >
      <span className="inline-flex items-center gap-1.5">
        <Feather className="size-3" strokeWidth={1.4} />
        {author}
      </span>
      <span className={`size-1 rounded-full ${sep}`} />
      <span className="inline-flex items-center gap-1.5">
        <Calendar className="size-3" strokeWidth={1.4} />
        {date}
      </span>
      <span className={`size-1 rounded-full ${sep}`} />
      <span className="inline-flex items-center gap-1.5">
        <Clock className="size-3" strokeWidth={1.4} />
        {readTime}
      </span>
    </div>
  )
}

function ProductCallout({
  productId,
  light = false,
}: {
  productId: string
  light?: boolean
}) {
  const p = getProduct(productId)
  const wrapBg = light
    ? "bg-[oklch(0.22_0.016_55/0.6)] ring-[oklch(0.4_0.028_55)] backdrop-blur"
    : "bg-[oklch(0.99_0.008_78)] ring-[oklch(0.86_0.018_70)]"
  const titleColor = light
    ? "text-[oklch(0.97_0.012_78)]"
    : "text-[oklch(0.18_0.014_55)]"
  const subColor = light
    ? "text-[oklch(0.78_0.018_70)]"
    : "text-[oklch(0.5_0.024_60)]"
  const labelColor = light
    ? "text-[oklch(0.78_0.04_70)]"
    : "text-[oklch(0.5_0.024_60)]"
  return (
    <div
      className={`rounded-md p-5 shadow-[0_18px_40px_-22px_oklch(0.34_0.03_55/0.35)] ring-1 lg:p-6 ${wrapBg}`}
    >
      <p
        className={`mb-4 text-[10px] font-semibold tracking-[0.32em] uppercase ${labelColor}`}
      >
        ✦ Sản phẩm trong bài
      </p>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="size-24 shrink-0 overflow-hidden rounded-sm bg-[oklch(0.94_0.014_75)] ring-1 ring-[oklch(0.86_0.018_70/0.6)] sm:size-28">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.src}
            alt={p.name}
            className="size-full object-cover grayscale-[0.05]"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p
            className={`text-[10px] font-semibold tracking-[0.28em] uppercase ${labelColor}`}
          >
            {p.provider.shopName} · {p.provider.location}
          </p>
          <p
            className={`font-display text-[18px] font-medium tracking-tight ${titleColor}`}
          >
            {p.name}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-display text-[20px] font-semibold tracking-tight text-[oklch(0.6_0.062_60)]">
              {p.rentalPrice.toLocaleString("vi-VN")}đ
              <span className={`ml-1 text-[11px] font-normal ${subColor}`}>
                / ngày
              </span>
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] ${subColor}`}
            >
              <Star className="size-3 fill-[oklch(0.78_0.04_70)] stroke-[oklch(0.78_0.04_70)]" />
              <span className="font-semibold">{p.rating}.0</span>
            </span>
          </div>
        </div>
        <Link href={`/product/${p.id}`} className="shrink-0">
          <Button className="ribbon-tan group/btn h-auto cursor-pointer rounded-full px-6 py-3 text-[11px] font-semibold tracking-[0.22em] uppercase">
            Thuê ngay
            <ArrowRight className="ml-1 size-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

function PullQuote({
  text,
  italic,
  light = false,
}: {
  text: string
  italic: string
  light?: boolean
}) {
  const main = light
    ? "text-[oklch(0.97_0.012_78)]"
    : "text-[oklch(0.18_0.014_55)]"
  const accent = light
    ? "text-[oklch(0.86_0.034_70)]"
    : "text-[oklch(0.6_0.062_60)]"
  const fill = light
    ? "fill-[oklch(0.6_0.062_60/0.35)]"
    : "fill-[oklch(0.6_0.062_60/0.18)]"
  return (
    <figure className="relative my-12 border-y border-[oklch(0.86_0.018_70)] py-10 lg:my-16 lg:py-14">
      <Quote
        className={`absolute -top-5 left-1/2 size-10 -translate-x-1/2 ${fill} stroke-none`}
        strokeWidth={1.2}
      />
      <blockquote
        className={`mx-auto max-w-2xl text-center font-display text-[22px] leading-[1.4] font-medium tracking-tight lg:text-[30px] lg:leading-[1.35] ${main}`}
      >
        {text} <span className={`italic ${accent}`}>{italic}</span>
      </blockquote>
    </figure>
  )
}

/* Transition divider between articles — self-contained cream bg so it never
   inherits body's theme-aware bg (which goes dark in dark mode). */
function NextHint({ next, short }: { next: string; short: string }) {
  const target = `#bai-${next.toLowerCase()}`
  return (
    <section
      aria-label={`Sang bài N°${next}`}
      className="relative border-y border-[oklch(0.86_0.018_70)] bg-[oklch(0.965_0.012_78)]"
    >
      <div
        aria-hidden
        className="bg-cream-grid pointer-events-none absolute inset-0 opacity-40"
      />
      <div className="relative mx-auto max-w-3xl px-6 py-14 text-center lg:py-20">
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-16 bg-[oklch(0.78_0.04_70)] sm:w-24" />
          <span className="font-display text-[16px] tracking-[0.32em] text-[oklch(0.6_0.062_60)] italic">
            ✦
          </span>
          <span className="h-px w-16 bg-[oklch(0.78_0.04_70)] sm:w-24" />
        </div>

        <a
          href={target}
          className="group mt-6 inline-flex flex-col items-center gap-3"
        >
          <span className="text-[11px] font-semibold tracking-[0.32em] text-[oklch(0.5_0.024_60)] uppercase lg:text-[12px] lg:tracking-[0.4em]">
            Bài tiếp · N°{next}
          </span>
          <span className="font-display text-[26px] leading-[1.2] tracking-tight text-[oklch(0.18_0.014_55)] transition-colors group-hover:text-[oklch(0.6_0.062_60)] lg:text-[36px]">
            <span className="italic">{short}</span>
          </span>
          <span className="mt-3 flex size-12 items-center justify-center rounded-full border border-[oklch(0.6_0.062_60)] text-[oklch(0.6_0.062_60)] transition-all duration-500 group-hover:translate-y-0.5 group-hover:bg-[oklch(0.6_0.062_60)] group-hover:text-[oklch(0.97_0.012_78)] group-hover:shadow-[0_18px_40px_-14px_oklch(0.34_0.03_55/0.55)]">
            <ArrowDown className="size-4" strokeWidth={1.6} />
          </span>
        </a>
      </div>
    </section>
  )
}

/* ─────────── Page ─────────── */

export default function NewsPage() {
  const p001 = getProduct("p001")
  const p002 = getProduct("p002")
  const p003 = getProduct("p003")
  const p005 = getProduct("p005")
  const p006 = getProduct("p006")
  const p007 = getProduct("p007")

  return (
    <div id="top" className="w-full overflow-x-clip">
      <ArticleNav />

      {/* ─────────── HERO ─────────── */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden">
        <div
          aria-hidden
          className="bg-cream-hero pointer-events-none absolute inset-0 -z-10"
        />
        <div
          aria-hidden
          className="bg-cream-grid pointer-events-none absolute inset-0 -z-10 opacity-50"
        />
        <div
          aria-hidden
          className="animate-float-soft pointer-events-none absolute top-[10%] left-[8%] -z-10 hidden size-80 rounded-full bg-[oklch(0.91_0.026_70/0.5)] blur-3xl lg:block"
        />
        <div
          aria-hidden
          className="animate-drift-alt pointer-events-none absolute right-[10%] bottom-[10%] -z-10 hidden size-96 rounded-full bg-[oklch(0.92_0.024_75/0.55)] blur-3xl lg:block"
          style={{ animationDelay: "-3s" }}
        />

        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-16 text-center lg:py-24">
          <Eyebrow label="✦ StyleLoop · Tin tức · 06 · 05 · 2026 ✦" />

          <h1 className="mt-9 font-display text-[52px] leading-[0.92] font-medium tracking-[-0.02em] text-[oklch(0.18_0.014_55)] uppercase lg:text-[120px]">
            Bài viết
          </h1>
          <p className="mt-7 font-display text-[52px] leading-[0.92] font-medium tracking-[-0.01em] text-[oklch(0.6_0.062_60)] italic lg:text-[120px]">
            nổi bật.
          </p>

          <div
            aria-hidden
            className="my-10 flex items-center gap-4 text-[oklch(0.6_0.062_60)] lg:my-12"
          >
            <span className="h-px w-16 bg-[oklch(0.78_0.04_70)]" />
            <span className="font-display text-[14px] tracking-[0.42em] italic">
              N°
            </span>
            <span className="h-px w-16 bg-[oklch(0.78_0.04_70)]" />
          </div>

          <p className="max-w-xl text-[15px] leading-[1.85] text-[oklch(0.4_0.024_55)] lg:text-[17px] lg:leading-[1.9]">
            Mỗi tuần, đội ngũ stylist của StyleLoop chọn ra những món đồ đáng
            chú ý nhất trong tủ — viết review thật, hướng dẫn phối đồ, và kể câu
            chuyện đằng sau mỗi chiếc váy.{" "}
            <span className="text-[oklch(0.18_0.014_55)] italic">
              Đọc bài, rồi thuê ngay
            </span>{" "}
            nếu bạn thấy hợp.
          </p>

          <a
            href="#bai-01"
            className="group mt-14 inline-flex flex-col items-center gap-3"
          >
            <span className="text-[10px] font-semibold tracking-[0.32em] text-[oklch(0.5_0.024_60)] uppercase transition-colors group-hover:text-[oklch(0.6_0.062_60)]">
              Cuộn để bắt đầu
            </span>
            <span className="flex size-12 items-center justify-center rounded-full border border-[oklch(0.6_0.062_60)] text-[oklch(0.6_0.062_60)] transition-all duration-500 group-hover:bg-[oklch(0.6_0.062_60)] group-hover:text-[oklch(0.97_0.012_78)] group-hover:shadow-[0_18px_40px_-14px_oklch(0.34_0.03_55/0.55)]">
              <ArrowDown
                className="size-4 animate-bounce [animation-duration:2.4s] group-hover:animate-none"
                strokeWidth={1.6}
              />
            </span>
          </a>
        </div>
      </section>

      {/* ─────────── MARQUEE BAND ─────────── */}
      <div
        aria-hidden
        className="relative overflow-hidden border-y border-[oklch(0.86_0.018_70)] bg-[oklch(0.94_0.014_75)] py-3"
      >
        <div className="animate-marquee flex w-max items-center gap-12 text-[oklch(0.34_0.03_55)]">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-12 font-display text-[13px] font-medium tracking-[0.22em] whitespace-nowrap uppercase"
            >
              <span>✦ Bài viết mới mỗi tuần</span>
              <span className="tracking-[0.08em] text-[oklch(0.6_0.062_60)] normal-case italic">
                Read · then rent
              </span>
              <span>✧ Review thật · giá thật · từ stylist</span>
              <span className="tracking-[0.08em] text-[oklch(0.6_0.062_60)] normal-case italic">
                stories of style
              </span>
              <span>✦ Mặc đẹp mà không cần sở hữu</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────── BÀI 01 — Cover spread ─────────── */}
      <article
        id="bai-01"
        className="relative scroll-mt-24 overflow-hidden bg-[oklch(0.965_0.012_78)]"
      >
        <div aria-hidden className="bg-cream-warm absolute inset-0" />
        <div
          aria-hidden
          className="bg-halftone-tan pointer-events-none absolute inset-x-0 top-0 mx-auto h-[420px] max-w-5xl opacity-25"
        />

        <div className="relative mx-auto max-w-[1200px] px-6 py-24 lg:px-12 lg:py-32">
          {/* Cover spread — image right, big title left */}
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div className="space-y-7">
              <Eyebrow label="N°01 · Cover story · Đi tiệc" />
              <h2 className="font-display text-[40px] leading-[0.98] font-medium tracking-[-0.02em] text-[oklch(0.18_0.014_55)] lg:text-[72px]">
                Đầm cami satin kem —{" "}
                <span className="text-[oklch(0.6_0.062_60)] italic">
                  cứu cánh date night.
                </span>
              </h2>
              <p className="text-[15px] leading-[1.85] text-[oklch(0.4_0.024_55)] lg:text-[16.5px]">
                82% cô gái 22–30 tuổi tại Hà Nội nói tủ đồ họ luôn cần ít nhất
                một chiếc cami satin tone kem. Đây là lý do — và ba cách mặc đi
                mặc lại không nhàm chán.
              </p>
              <ByLine
                author="Linh Chi"
                date="06 · 05 · 2026"
                readTime="8 phút đọc"
              />
            </div>

            <div className="relative">
              <div className="rotated-card-2 relative overflow-hidden rounded-sm bg-[oklch(0.99_0.008_78)] p-3 shadow-[0_36px_70px_-26px_oklch(0.34_0.03_55/0.55)] ring-1 ring-[oklch(0.86_0.018_70)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p001.src}
                  alt={p001.name}
                  className="aspect-[4/5] w-full object-cover grayscale-[0.06]"
                />
                <div className="absolute top-5 left-5 rounded-full bg-[oklch(0.18_0.014_55)] px-3.5 py-1.5 text-[10px] font-semibold tracking-[0.32em] text-[oklch(0.97_0.012_78)] uppercase">
                  Cover
                </div>
                <div className="absolute top-5 right-5 rounded-sm bg-[oklch(0.6_0.062_60)] px-3 py-1.5 text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.97_0.012_78)] uppercase">
                  {p001.rentalPrice.toLocaleString("vi-VN")}đ / ngày
                </div>
              </div>
              <span className="absolute -top-10 -left-6 hidden font-display text-[160px] leading-none font-medium text-[oklch(0.6_0.062_60/0.18)] italic lg:block">
                01
              </span>
              <Sparkles
                className="animate-float-soft absolute right-2 -bottom-5 size-9 fill-[oklch(0.86_0.034_70)] stroke-[oklch(0.6_0.062_60)]"
                style={{ ["--spin" as string]: "-8deg" } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Body */}
          <div className="mx-auto mt-16 max-w-2xl space-y-6 text-[15.5px] leading-[1.95] text-[oklch(0.34_0.03_55)] lg:mt-24 lg:text-[16.5px]">
            <p className="first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-[68px] first-letter:leading-[0.85] first-letter:font-medium first-letter:text-[oklch(0.6_0.062_60)] first-letter:italic lg:first-letter:text-[88px]">
              Mỗi tháng StyleLoop đo lượt thuê của hơn 10,000 món đồ. Tháng tư
              vừa rồi, có một con số làm cả team ngạc nhiên: chiếc đầm cami
              satin kem của Minhchau Closet được thuê{" "}
              <b>47 lần trong 30 ngày</b> — tức gần như ngày nào cũng có một cô
              gái khoác nó lên người. Với giá thuê 80,000đ/ngày trong khi giá
              mới là 950,000đ, đây có lẽ là một trong những bài toán kinh tế dễ
              chịu nhất trong tủ đồ.
            </p>
            <p>
              Câu hỏi đặt ra là: tại sao chính chiếc cami satin tone kem này —
              chứ không phải một chiếc khác — lại được mặc đi mặc lại nhiều đến
              vậy? Lý do đơn giản: nó là một <i>blank canvas</i>. Tone kem đủ
              trung tính để đi với gần như mọi phụ kiện. Chất satin bóng nhẹ vừa
              đủ sang, không quá lung linh để bị “quá tiệc”.
            </p>

            <h3 className="pt-4 font-display text-[24px] font-medium tracking-tight text-[oklch(0.18_0.014_55)] lg:text-[28px]">
              Ba cách mặc, ba phong cách
            </h3>

            <ul className="space-y-5">
              {[
                {
                  n: "01",
                  title: "Date night cuối tuần",
                  body: "Sandals quai mảnh tone nude, kẹp tóc nhỏ tone đồng. Khoác cardigan dệt kim mỏng nếu trời se lạnh.",
                },
                {
                  n: "02",
                  title: "Đi làm thanh lịch",
                  body: "Blazer linen oversize tone be hoặc nâu nhạt + mules da bò. Buộc tóc thấp, gọn gàng.",
                },
                {
                  n: "03",
                  title: "Tiệc tối nhỏ",
                  body: "Heels 7cm tone champagne + clutch nhỏ + một dây chuyền mảnh. Vén tóc lên một bên.",
                },
              ].map((s) => (
                <li
                  key={s.n}
                  className="flex gap-5 border-l border-[oklch(0.78_0.04_70)] pl-5"
                >
                  <span className="font-display text-[14px] tracking-[0.32em] text-[oklch(0.6_0.062_60)] uppercase">
                    {s.n}
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className="font-display text-[17px] font-medium tracking-tight text-[oklch(0.18_0.014_55)]">
                      {s.title}
                    </p>
                    <p className="text-[14.5px] leading-[1.85] text-[oklch(0.5_0.024_60)]">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <PullQuote
              text="Một chiếc đầm tốt không phải là chiếc đẹp nhất —"
              italic="mà là chiếc bạn mặc được nhiều lần nhất."
            />

            <p>
              Chất satin polyester pha viscose của chiếc đầm này bóng nhẹ, không
              quá rực, ít nhăn. Phù hợp nhất với các bạn cao 1m58–1m65. Size S
              vừa người 45–48kg, size M cho 49–55kg. Bảo hiểm vết bẩn nhẹ đã gồm
              trong giá thuê.
            </p>

            <div className="pt-4">
              <ProductCallout productId="p001" />
            </div>
          </div>
        </div>
      </article>

      <NextHint next="02" short="Voan hoa nhỏ — 5 cách phối" />

      {/* ─────────── BÀI 02 — Lookbook ─────────── */}
      <article
        id="bai-02"
        className="relative scroll-mt-24 overflow-hidden border-t border-[oklch(0.86_0.018_70)] bg-[oklch(0.94_0.014_75)]"
      >
        <div
          aria-hidden
          className="bg-tan-stripes pointer-events-none absolute inset-0 opacity-25"
        />

        <div className="relative mx-auto max-w-[1200px] px-6 py-24 lg:px-12 lg:py-32">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
            {/* Image left */}
            <div className="relative order-2 lg:order-1">
              <div className="rotated-card-1 relative overflow-hidden rounded-sm bg-[oklch(0.99_0.008_78)] p-3 shadow-[0_36px_70px_-26px_oklch(0.34_0.03_55/0.55)] ring-1 ring-[oklch(0.86_0.018_70)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p002.src}
                  alt={p002.name}
                  className="aspect-[4/5] w-full object-cover grayscale-[0.06]"
                />
                <div className="absolute top-5 left-5 rounded-full bg-[oklch(0.18_0.014_55)] px-3.5 py-1.5 text-[10px] font-semibold tracking-[0.32em] text-[oklch(0.97_0.012_78)] uppercase">
                  Lookbook
                </div>
                <div className="absolute top-5 right-5 rounded-sm bg-[oklch(0.6_0.062_60)] px-3 py-1.5 text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.97_0.012_78)] uppercase">
                  {p002.rentalPrice.toLocaleString("vi-VN")}đ / ngày
                </div>
              </div>
              <span className="absolute -top-10 -right-6 hidden font-display text-[160px] leading-none font-medium text-[oklch(0.6_0.062_60/0.15)] italic lg:block">
                02
              </span>
            </div>

            <div className="order-1 space-y-7 lg:order-2">
              <Eyebrow label="N°02 · Lookbook · Mùa hè" />
              <h2 className="font-display text-[36px] leading-[1.02] font-medium tracking-[-0.01em] text-[oklch(0.18_0.014_55)] lg:text-[60px]">
                Voan hoa nhỏ —{" "}
                <span className="text-[oklch(0.6_0.062_60)] italic">
                  năm cách phối
                </span>{" "}
                cho mùa hè không nhàm chán.
              </h2>
              <p className="text-[15px] leading-[1.85] text-[oklch(0.4_0.024_55)] lg:text-[16.5px]">
                Một chiếc váy midi voan hoa nhỏ tưởng đơn giản, nhưng có thể đi
                từ buổi cà phê sáng đến tiệc rooftop tối — chỉ cần đổi phụ kiện.
                Stylist Minh Anh thử năm cách phối khác nhau với cùng một chiếc
                váy của Trang’s Wardrobe.
              </p>
              <ByLine
                author="Minh Anh"
                date="04 · 05 · 2026"
                readTime="6 phút đọc"
              />
            </div>
          </div>

          {/* 5 looks grid */}
          <div className="mx-auto mt-16 max-w-3xl lg:mt-24">
            <div className="mb-10 flex items-center justify-center gap-4 text-center">
              <span className="h-px w-12 bg-[oklch(0.78_0.04_70)]" />
              <span className="font-display text-[12px] tracking-[0.32em] text-[oklch(0.6_0.062_60)] uppercase italic">
                ✦ Năm cách phối ✦
              </span>
              <span className="h-px w-12 bg-[oklch(0.78_0.04_70)]" />
            </div>

            <ol className="space-y-4">
              {[
                {
                  icon: Coffee,
                  n: "01",
                  title: "Cà phê sáng cuối tuần",
                  body: "Sneakers trắng cũ + tote canvas + kẹp tóc sò. Buộc cardigan mỏng quanh thắt lưng — French girl vibes chân thật.",
                },
                {
                  icon: Bookmark,
                  n: "02",
                  title: "Đi làm casual Friday",
                  body: "Blazer linen tone be + loafer da bò + tote cứng cỡ trung. Ổn cho cả buổi họp khách hàng nhẹ.",
                },
                {
                  icon: Heart,
                  n: "03",
                  title: "Hẹn hò chiều muộn",
                  body: "Sandals quai mảnh nude + clutch nhỏ + kính râm gọng nhỏ. Tóc xoăn nhẹ tự nhiên.",
                },
                {
                  icon: Camera,
                  n: "04",
                  title: "Picnic cuối tuần",
                  body: "Sunhat cói rộng vành + slip-on canvas + túi vải hoa. Khăn lụa nhỏ buộc tóc làm điểm nhấn.",
                },
                {
                  icon: Sparkles,
                  n: "05",
                  title: "Tiệc rooftop buổi tối",
                  body: "Heels mảnh 7cm + jewelry tối giản + clutch sequin nhẹ. Tone-on-tone với tone hoa.",
                },
              ].map((look) => {
                const Icon = look.icon
                return (
                  <li
                    key={look.n}
                    className="group flex gap-5 rounded-md bg-[oklch(0.99_0.008_78)] p-5 ring-1 ring-[oklch(0.86_0.018_70)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_oklch(0.34_0.03_55/0.4)]"
                  >
                    <div className="flex shrink-0 flex-col items-center gap-3">
                      <span className="font-display text-[13px] tracking-[0.32em] text-[oklch(0.6_0.062_60)] uppercase">
                        {look.n}
                      </span>
                      <div className="flex size-11 items-center justify-center rounded-full bg-[oklch(0.94_0.014_75)] ring-1 ring-[oklch(0.86_0.018_70)] transition-colors duration-500 group-hover:bg-[oklch(0.18_0.014_55)] group-hover:ring-[oklch(0.18_0.014_55)]">
                        <Icon
                          className="size-4 text-[oklch(0.6_0.062_60)] transition-colors duration-500 group-hover:text-[oklch(0.86_0.034_70)]"
                          strokeWidth={1.4}
                        />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <h4 className="font-display text-[17px] font-medium tracking-tight text-[oklch(0.18_0.014_55)] lg:text-[19px]">
                        {look.title}
                      </h4>
                      <p className="text-[14px] leading-[1.8] text-[oklch(0.5_0.024_60)]">
                        {look.body}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>

            <div className="mt-10">
              <ProductCallout productId="p002" />
            </div>
          </div>
        </div>
      </article>

      <NextHint next="03" short="Lụa trễ vai — review 3 cô gái" />

      {/* ─────────── BÀI 03 — Review 3 perspectives ─────────── */}
      <article
        id="bai-03"
        className="relative scroll-mt-24 overflow-hidden border-t border-[oklch(0.86_0.018_70)]"
      >
        <div aria-hidden className="bg-cream-soft absolute inset-0" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-[8%] -z-0 size-72 rounded-full bg-[oklch(0.91_0.026_70/0.4)] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[10%] -bottom-20 -z-0 size-80 rounded-full bg-[oklch(0.92_0.024_75/0.45)] blur-3xl"
        />

        <div className="relative mx-auto max-w-[1100px] px-6 py-24 lg:px-12 lg:py-32">
          <header className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center">
              <Eyebrow label="N°03 · Review · 3 perspectives" />
            </div>
            <h2 className="mt-6 font-display text-[36px] leading-[1.02] font-medium tracking-[-0.01em] text-[oklch(0.18_0.014_55)] lg:text-[60px]">
              Lụa trễ vai dáng A —{" "}
              <span className="text-[oklch(0.6_0.062_60)] italic">
                ba cô gái, ba cảm nhận khác nhau.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[14.5px] leading-[1.85] text-[oklch(0.5_0.024_60)] italic lg:text-[16px]">
              Cùng một chiếc đầm lụa trễ vai dáng A của Luxury Closet HCM. Ba cô
              gái có dáng người khác nhau (S, M, M-cao). Mỗi cô mặc trong một
              tuần. Đây là cảm nhận thật, không kịch bản.
            </p>
            <div className="mt-7 flex justify-center">
              <ByLine
                author="Thu Hà"
                date="02 · 05 · 2026"
                readTime="9 phút đọc"
              />
            </div>
          </header>

          {/* Hero image full-width */}
          <figure className="mt-14 lg:mt-20">
            <div className="relative overflow-hidden rounded-sm bg-[oklch(0.99_0.008_78)] p-3 pb-10 shadow-[0_36px_70px_-26px_oklch(0.34_0.03_55/0.5)] ring-1 ring-[oklch(0.86_0.018_70)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p003.src}
                alt={p003.name}
                className="aspect-[16/9] w-full object-cover grayscale-[0.06]"
              />
              <div className="absolute right-5 bottom-3 left-5 flex items-center justify-between text-[10px] tracking-[0.32em] uppercase">
                <span className="font-display text-[oklch(0.34_0.03_55)]">
                  {p003.provider.shopName}
                </span>
                <span className="text-[oklch(0.6_0.062_60)]">
                  ★ {p003.rating}.0 · {p003.color}
                </span>
              </div>
            </div>
          </figure>

          <div className="mx-auto mt-12 max-w-2xl space-y-6 text-[15.5px] leading-[1.95] text-[oklch(0.34_0.03_55)] lg:mt-16 lg:text-[16.5px]">
            <p className="first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-[68px] first-letter:leading-[0.85] first-letter:font-medium first-letter:text-[oklch(0.6_0.062_60)] first-letter:italic lg:first-letter:text-[88px]">
              Khi review một chiếc đầm, đa số chúng ta chỉ thấy hình ảnh trên
              mẫu — và mẫu thì luôn cao 1m70, nặng 47kg, mặc cái gì cũng đẹp. Vì
              thế chúng tôi mời ba cô gái Việt với dáng người hoàn toàn khác
              nhau cùng thuê chiếc đầm này, mỗi người mặc một tuần.
            </p>
          </div>

          {/* 3 reviewers */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:mt-16 lg:gap-8">
            {[
              {
                name: "An Nhi",
                size: "S · 1m55 · 46kg",
                avatar: "/Home-Img/feedback/image-1.jpg",
                quote:
                  "Mình hơi lo dáng A sẽ làm mình bị chìm nhưng thực tế váy ôm phần ngực vừa vặn, phần xòe ở hông tạo cảm giác cao hơn.",
              },
              {
                name: "Thảo My",
                size: "M · 1m60 · 53kg",
                avatar: "/Home-Img/feedback/image-2.jpg",
                quote:
                  "Đây là kiểu váy mình hay tránh vì sợ phần trễ vai sẽ tuột — nhưng chiếc này có dây nịt giấu bên trong khá chắc.",
              },
              {
                name: "Linh Chi",
                size: "M · 1m70 · 55kg",
                avatar: "/Home-Img/feedback/image-3.jpg",
                quote:
                  "Chiều cao mình thì váy chấm trên đầu gối nhẹ, nhìn gọn gàng hơn so với bạn 1m60. Nếu cao trên 1m72 thì có thể ngắn quá.",
              },
            ].map((r) => (
              <figure
                key={r.name}
                className="group relative rounded-md bg-[oklch(0.99_0.008_78)] p-6 shadow-[0_18px_40px_-22px_oklch(0.34_0.03_55/0.35)] ring-1 ring-[oklch(0.86_0.018_70)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_56px_-22px_oklch(0.34_0.03_55/0.5)]"
              >
                <Quote
                  className="absolute -top-3 left-4 size-7 fill-[oklch(0.6_0.062_60/0.3)] stroke-none"
                  strokeWidth={1.4}
                />
                <blockquote className="text-[14px] leading-[1.85] text-[oklch(0.4_0.024_55)] italic">
                  “{r.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-[oklch(0.86_0.018_70)] pt-4">
                  <div className="size-10 shrink-0 overflow-hidden rounded-full ring-1 ring-[oklch(0.78_0.04_70)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.avatar}
                      alt={r.name}
                      className="size-full object-cover grayscale-[0.1]"
                    />
                  </div>
                  <div>
                    <p className="font-display text-[15px] font-medium tracking-tight text-[oklch(0.18_0.014_55)]">
                      {r.name}
                    </p>
                    <p className="text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.5_0.024_60)] uppercase">
                      {r.size}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-2xl space-y-6 text-[15.5px] leading-[1.95] text-[oklch(0.34_0.03_55)] lg:text-[16.5px]">
            <p>
              Chiếc đầm này thực sự là một <i>safe choice</i> cho ba dáng người
              phổ biến nhất ở Việt Nam (1m55–1m70). Tone be neutral đi với hầu
              hết phụ kiện sẵn có — nếu phân vân cho một sự kiện cưới hỏi tầm
              trung, đây là lựa chọn ít rủi ro.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-2xl">
            <ProductCallout productId="p003" />
          </div>
        </div>
      </article>

      {/* ─────────── BÀI 04 — Stylist's pick (full-width DARK) ─────────── */}
      <article
        id="bai-04"
        className="relative scroll-mt-24 overflow-hidden bg-[oklch(0.18_0.014_55)] text-[oklch(0.94_0.014_75)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_15%_30%,oklch(0.4_0.05_60/0.4),transparent_70%),radial-gradient(ellipse_55%_45%_at_85%_75%,oklch(0.6_0.062_60/0.22),transparent_72%)] opacity-50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,oklch(0.6_0.062_60/0.6),transparent)]"
        />
        <div
          aria-hidden
          className="bg-noise pointer-events-none absolute inset-0 opacity-15 mix-blend-overlay"
        />

        <div className="relative mx-auto max-w-[1100px] px-6 py-24 lg:px-12 lg:py-32">
          <header className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center">
              <Eyebrow label="N°04 · Stylist's pick · Đi tiệc" light />
            </div>
            <h2 className="mt-6 font-display text-[36px] leading-[1.02] font-medium tracking-[-0.01em] text-[oklch(0.97_0.012_78)] lg:text-[64px]">
              Sequin champagne —{" "}
              <span className="text-[oklch(0.86_0.034_70)] italic">
                lựa chọn N°1 cho tiệc tối.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[14.5px] leading-[1.85] text-[oklch(0.82_0.018_70)] italic lg:text-[16px]">
              Một chiếc đầm sequin có thể quá lung linh cho tiệc văn phòng — nếu
              không biết cách tone-down. Linh Chi gợi ý bốn cách phối để chiếc
              đầm này hợp cả gala lẫn happy hour.
            </p>
            <div className="mt-7 flex justify-center">
              <ByLine
                author="Linh Chi"
                date="30 · 04 · 2026"
                readTime="6 phút đọc"
                light
              />
            </div>
          </header>

          <figure className="mt-14 lg:mt-20">
            <div className="relative overflow-hidden rounded-sm bg-[oklch(0.99_0.008_78)] p-3 pb-10 shadow-[0_40px_80px_-26px_oklch(0.18_0.014_55/0.7)] ring-1 ring-[oklch(0.4_0.024_55)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p006.src}
                alt={p006.name}
                className="aspect-[16/9] w-full object-cover grayscale-[0.08]"
              />
              <div className="absolute right-5 bottom-3 left-5 flex items-center justify-between text-[10px] tracking-[0.32em] uppercase">
                <span className="font-display text-[oklch(0.34_0.03_55)]">
                  {p006.provider.shopName}
                </span>
                <span className="text-[oklch(0.6_0.062_60)]">
                  {p006.color} · ★ {p006.rating}.0
                </span>
              </div>
            </div>
          </figure>

          <div className="mx-auto mt-12 max-w-2xl space-y-6 text-[15px] leading-[1.95] text-[oklch(0.82_0.018_70)] lg:mt-16 lg:text-[16.5px]">
            <p>
              Mùa year-end party đến rồi. Thay vì chi 1.8 triệu để mua một chiếc
              đầm sequin chỉ mặc 1–2 lần, bạn có thể thuê chiếc của Minhchau
              Closet với 150,000đ/ngày. Đây là bốn cách để vẫn lung linh mà
              không bị “quá dạ hội”.
            </p>

            <ol className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {[
                {
                  n: "01",
                  title: "Cardigan dệt kim oversize",
                  body: "Tone be hoặc nâu cát phủ ngoài làm dịu hẳn hiệu ứng sequin.",
                },
                {
                  n: "02",
                  title: "Boots cổ thấp chunky",
                  body: "Da bò tone đậm sẽ kéo trọng tâm xuống, bớt vẻ red carpet.",
                },
                {
                  n: "03",
                  title: "Blazer tone trung tính",
                  body: "Linen cát hoặc xám đậm khoác hờ qua một bên vai. Không cài cúc.",
                },
                {
                  n: "04",
                  title: "Backpack mềm tone đồng",
                  body: "Thay clutch — tạo cảm giác “vừa rời văn phòng đi event”.",
                },
              ].map((tip) => (
                <li
                  key={tip.n}
                  className="rounded-md bg-[oklch(0.22_0.016_55/0.6)] p-5 ring-1 ring-[oklch(0.4_0.028_55)] backdrop-blur"
                >
                  <div className="flex items-start gap-4">
                    <span className="font-display text-[28px] leading-none font-medium text-[oklch(0.86_0.034_70)] italic lg:text-[40px]">
                      {tip.n}
                    </span>
                    <div className="flex-1 space-y-1.5">
                      <h4 className="font-display text-[17px] font-medium tracking-tight text-[oklch(0.97_0.012_78)] lg:text-[19px]">
                        {tip.title}
                      </h4>
                      <p className="text-[13.5px] leading-[1.8] text-[oklch(0.78_0.018_70)]">
                        {tip.body}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <PullQuote
              text="Sequin không cần phải là dạ hội —"
              italic="nó chỉ cần được mặc đúng cách."
              light
            />
          </div>

          <div className="mx-auto mt-10 max-w-2xl">
            <ProductCallout productId="p006" light />
          </div>
        </div>
      </article>

      <NextHint next="05" short="Wrap midi tone đất — công sở" />

      {/* ─────────── BÀI 05 — Office wear ─────────── */}
      <article
        id="bai-05"
        className="relative scroll-mt-24 overflow-hidden border-t border-[oklch(0.86_0.018_70)] bg-[oklch(0.965_0.012_78)]"
      >
        <div aria-hidden className="bg-cream-warm absolute inset-0" />
        <div
          aria-hidden
          className="bg-halftone-tan pointer-events-none absolute inset-x-0 top-0 mx-auto h-[420px] max-w-5xl opacity-25"
        />

        <div className="relative mx-auto max-w-[1200px] px-6 py-24 lg:px-12 lg:py-32">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <div className="space-y-7">
              <Eyebrow label="N°05 · Công sở · Style guide" />
              <h2 className="font-display text-[36px] leading-[1.02] font-medium tracking-[-0.01em] text-[oklch(0.18_0.014_55)] lg:text-[60px]">
                Wrap midi tone đất —{" "}
                <span className="text-[oklch(0.6_0.062_60)] italic">
                  chiếc váy công sở đáng đầu tư.
                </span>
              </h2>
              <p className="text-[15px] leading-[1.85] text-[oklch(0.4_0.024_55)] lg:text-[16.5px]">
                Tone đất là màu của năm. Chiếc wrap midi này là cách dễ nhất để
                bạn đưa nó vào tủ đồ công sở — hợp tới 80% blazer bạn đang có
                sẵn.
              </p>
              <ByLine
                author="Linh Chi"
                date="28 · 04 · 2026"
                readTime="7 phút đọc"
              />
            </div>

            <div className="relative">
              <div className="rotated-card-3 relative overflow-hidden rounded-sm bg-[oklch(0.99_0.008_78)] p-3 shadow-[0_36px_70px_-26px_oklch(0.34_0.03_55/0.55)] ring-1 ring-[oklch(0.86_0.018_70)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p005.src}
                  alt={p005.name}
                  className="aspect-[4/5] w-full object-cover grayscale-[0.06]"
                />
                <div className="absolute top-5 left-5 rounded-full bg-[oklch(0.18_0.014_55)] px-3.5 py-1.5 text-[10px] font-semibold tracking-[0.32em] text-[oklch(0.97_0.012_78)] uppercase">
                  Công sở
                </div>
                <div className="absolute top-5 right-5 rounded-sm bg-[oklch(0.6_0.062_60)] px-3 py-1.5 text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.97_0.012_78)] uppercase">
                  {p005.rentalPrice.toLocaleString("vi-VN")}đ / ngày
                </div>
              </div>
              <span className="absolute -top-10 -left-6 hidden font-display text-[160px] leading-none font-medium text-[oklch(0.6_0.062_60/0.15)] italic lg:block">
                05
              </span>
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-2xl space-y-6 text-[15.5px] leading-[1.95] text-[oklch(0.34_0.03_55)] lg:mt-24 lg:text-[16.5px]">
            <p>
              Có một câu nói trong giới stylist: “Khi không biết mặc gì đi làm,
              hãy mặc một chiếc wrap dress tone đất.” Form wrap ôm eo tự nhiên,
              kéo dài chân; chất liệu cotton modal của chiếc Trang’s Wardrobe
              này không nhăn — bạn có thể gấp gọn vào balo và lôi ra mặc cho
              cuộc họp afternoon mà vẫn phẳng.
            </p>
            <p>
              Đây là lịch tủ đồ ba ngày của một bạn account director — cô ấy chỉ
              cần đúng một chiếc wrap dress để xoay tua cả tuần làm việc.
            </p>

            <ol className="my-6 space-y-5">
              {[
                {
                  day: "Thứ 2",
                  outfit:
                    "+ áo sơ mi trắng oversize buộc nút trong eo + loafer da bò",
                  vibe: "Chỉn chu, sẵn sàng cho buổi họp đầu tuần.",
                },
                {
                  day: "Thứ 4",
                  outfit: "+ blazer navy + ankle boots chunky tone đậm",
                  vibe: "Power look cho cuộc gặp khách hàng.",
                },
                {
                  day: "Thứ 6",
                  outfit: "+ cardigan dệt kim be + sneakers trắng cũ",
                  vibe: "Casual Friday, sẵn sàng cho happy hour.",
                },
              ].map((d) => (
                <li
                  key={d.day}
                  className="border-l border-[oklch(0.78_0.04_70)] pl-5"
                >
                  <p className="font-display text-[13px] tracking-[0.32em] text-[oklch(0.6_0.062_60)] uppercase">
                    {d.day}
                  </p>
                  <p className="mt-1 font-display text-[16px] font-medium tracking-tight text-[oklch(0.18_0.014_55)]">
                    Wrap dress {d.outfit}
                  </p>
                  <p className="mt-1 text-[13.5px] leading-[1.75] text-[oklch(0.5_0.024_60)] italic">
                    {d.vibe}
                  </p>
                </li>
              ))}
            </ol>

            <PullQuote
              text="Một chiếc wrap dress tone đất —"
              italic="ba ngày làm việc, ba phong cách."
            />

            <p>
              Tổng chi phí thuê chiếc này cho 5 ngày: 350,000đ. So với việc mua
              mới 820,000đ và phải tự bảo quản — bạn vừa tiết kiệm gần 60%, vừa
              không phải lo tủ đồ chật thêm.
            </p>

            <div className="pt-4">
              <ProductCallout productId="p005" />
            </div>
          </div>
        </div>
      </article>

      <NextHint next="06" short="Babydoll ren — 5 spot chụp ảnh" />

      {/* ─────────── BÀI 06 — Photo guide ─────────── */}
      <article
        id="bai-06"
        className="relative scroll-mt-24 overflow-hidden border-t border-[oklch(0.86_0.018_70)] bg-[oklch(0.94_0.014_75)]"
      >
        <div
          aria-hidden
          className="bg-tan-stripes pointer-events-none absolute inset-0 opacity-25"
        />

        <div className="relative mx-auto max-w-[1100px] px-6 py-24 lg:px-12 lg:py-32">
          <header className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center">
              <Eyebrow label="N°06 · Vintage · Cottagecore" />
            </div>
            <h2 className="mt-6 font-display text-[36px] leading-[1.02] font-medium tracking-[-0.01em] text-[oklch(0.18_0.014_55)] lg:text-[60px]">
              Babydoll ren trắng —{" "}
              <span className="text-[oklch(0.6_0.062_60)] italic">
                chiếc váy của những bức ảnh tủ.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[14.5px] leading-[1.85] text-[oklch(0.5_0.024_60)] italic lg:text-[16px]">
              Cứ mỗi mùa hoa loa kèn về Hà Nội, chiếc babydoll ren trắng lại
              được thuê liên tục. Đây là năm spot đẹp nhất bạn nên chụp với nó.
            </p>
            <div className="mt-7 flex justify-center">
              <ByLine
                author="Thu Hà"
                date="22 · 04 · 2026"
                readTime="5 phút đọc"
              />
            </div>
          </header>

          <figure className="mt-14 lg:mt-20">
            <div className="rotated-card-2 relative overflow-hidden rounded-sm bg-[oklch(0.99_0.008_78)] p-3 pb-10 shadow-[0_36px_70px_-26px_oklch(0.34_0.03_55/0.5)] ring-1 ring-[oklch(0.86_0.018_70)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p007.src}
                alt={p007.name}
                className="aspect-[16/9] w-full object-cover grayscale-[0.05]"
              />
              <div className="absolute right-5 bottom-3 left-5 flex items-center justify-between text-[10px] tracking-[0.32em] uppercase">
                <span className="font-display text-[oklch(0.34_0.03_55)]">
                  {p007.provider.shopName}
                </span>
                <span className="text-[oklch(0.6_0.062_60)]">
                  {p007.color} · Babydoll
                </span>
              </div>
            </div>
          </figure>

          <ol className="mx-auto mt-16 max-w-3xl space-y-4 lg:mt-20">
            {[
              {
                n: "01",
                title: "Phố Phan Đình Phùng — sáng sớm 6h–7h",
                body: "Ánh sáng xuyên hàng sấu đầu hè, vỉa hè vắng. Tường vàng cũ + xe đạp dựa cạnh = combo cottagecore không thể fail.",
              },
              {
                n: "02",
                title: "Hồ Gươm — phía cầu Thê Húc lúc bình minh",
                body: "Tone đỏ của cầu hợp với ren trắng. Đứng đối mặt với mặt trời mọc, để đèn lồng nhỏ làm prop.",
              },
              {
                n: "03",
                title: "Bãi đá Phúc Tân — chiều muộn 17h",
                body: "Sông Hồng mùa hè, cỏ may dại, ánh sáng vàng kim. Babydoll trắng nổi bật trên nền cỏ vàng.",
              },
              {
                n: "04",
                title: "Ngõ Tạ Hiện — chiều mưa nhẹ",
                body: "Ngõ vắng trước 6h tối. Tường vàng cũ + ô đen trong tay = ảnh có thể đăng kèm thơ Hà Nội.",
              },
              {
                n: "05",
                title: "Cánh đồng hoa loa kèn Long Biên — tháng tư",
                body: "Đỉnh cao của combo này. Babydoll giữa cánh đồng hoa loa kèn — một ảnh đủ lưu giữ cả mùa hè.",
              },
            ].map((spot) => (
              <li
                key={spot.n}
                className="group flex gap-5 rounded-md bg-[oklch(0.99_0.008_78)] p-5 ring-1 ring-[oklch(0.86_0.018_70)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_oklch(0.34_0.03_55/0.4)]"
              >
                <div className="flex shrink-0 flex-col items-center gap-2">
                  <span className="font-display text-[13px] tracking-[0.32em] text-[oklch(0.6_0.062_60)] uppercase">
                    {spot.n}
                  </span>
                  <Camera
                    className="size-5 text-[oklch(0.6_0.062_60)]"
                    strokeWidth={1.4}
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <h4 className="font-display text-[17px] font-medium tracking-tight text-[oklch(0.18_0.014_55)] lg:text-[19px]">
                    {spot.title}
                  </h4>
                  <p className="text-[14px] leading-[1.8] text-[oklch(0.5_0.024_60)]">
                    {spot.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mx-auto mt-12 max-w-2xl">
            <ProductCallout productId="p007" />
          </div>
        </div>
      </article>

      {/* ─────────── NEWSLETTER ─────────── */}
      <section
        id="newsletter"
        className="relative overflow-hidden border-t border-[oklch(0.86_0.018_70)] bg-[oklch(0.18_0.014_55)] text-[oklch(0.94_0.014_75)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_25%_25%,oklch(0.6_0.062_60/0.28),transparent_70%),radial-gradient(ellipse_55%_45%_at_80%_80%,oklch(0.4_0.05_60/0.3),transparent_72%)] opacity-60"
        />
        <div
          aria-hidden
          className="bg-noise pointer-events-none absolute inset-0 opacity-15 mix-blend-overlay"
        />

        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center lg:py-28">
          <Eyebrow label="✦ Đừng bỏ lỡ số tuần tới ✦" light />

          <h2 className="mt-7 font-display text-[36px] leading-[1.02] font-medium tracking-[-0.01em] text-[oklch(0.97_0.012_78)] lg:text-[60px]">
            Bài viết mới,{" "}
            <span className="text-[oklch(0.86_0.034_70)] italic">
              gửi thẳng vào hộp thư.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.85] text-[oklch(0.82_0.018_70)]">
            Bản tin ngắn vào sáng thứ Sáu — review sản phẩm hot tuần qua, gợi ý
            outfit cho cuối tuần, và mã giảm giá riêng cho người đăng ký.
          </p>

          <form className="mx-auto mt-9 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Mail
                className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[oklch(0.78_0.04_70)]"
                strokeWidth={1.4}
              />
              <Input
                type="email"
                placeholder="email@cuaban.com"
                aria-label="Email"
                className="h-12 w-full rounded-full border border-[oklch(0.4_0.028_55)] bg-[oklch(0.22_0.016_55)] px-12 text-[13px] text-[oklch(0.97_0.012_78)] shadow-none placeholder:text-[oklch(0.6_0.024_60)] focus-visible:border-[oklch(0.6_0.062_60)] focus-visible:ring-2 focus-visible:ring-[oklch(0.6_0.062_60/0.3)]"
              />
            </div>
            <Button
              type="submit"
              className="ribbon-tan group/btn h-12 cursor-pointer rounded-full px-7 text-[11px] font-semibold tracking-[0.22em] uppercase"
            >
              Đăng ký
              <ArrowRight className="ml-1 size-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.78_0.018_70)] uppercase">
            <span className="inline-flex items-center gap-2">
              <Compass
                className="size-3.5 text-[oklch(0.86_0.034_70)]"
                strokeWidth={1.4}
              />
              12,400+ độc giả
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles
                className="size-3.5 text-[oklch(0.86_0.034_70)]"
                strokeWidth={1.4}
              />
              Mã giảm giá riêng
            </span>
            <span className="inline-flex items-center gap-2">
              <Bookmark
                className="size-3.5 text-[oklch(0.86_0.034_70)]"
                strokeWidth={1.4}
              />
              Hủy bất kỳ lúc nào
            </span>
          </div>

          <div className="mt-12 inline-flex items-center gap-3">
            <span className="h-px w-12 bg-[oklch(0.78_0.04_70)]" />
            <span className="font-display text-[12px] tracking-[0.32em] text-[oklch(0.86_0.034_70)] italic">
              — đọc, rồi thuê.
            </span>
            <span className="h-px w-12 bg-[oklch(0.78_0.04_70)]" />
          </div>
        </div>
      </section>
    </div>
  )
}
