import Link from "next/link"
import {
  ArrowRight,
  Heart,
  Leaf,
  Quote,
  Recycle,
  ShieldCheck,
  Sparkles,
  Star,
  Compass,
  Gem,
  Hand,
  Mail,
  MapPin,
  Phone,
  Scissors,
  Truck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { CtaButtons } from "./cta-buttons"

const PILLARS = [
  {
    kicker: "01",
    icon: Sparkles,
    title: "Tinh tuyển",
    italic: "Curated with care",
    body: "Mỗi món đồ đều được stylist của StyleLoop thẩm định kỹ lưỡng — từ chất liệu, đường may đến tinh thần thiết kế.",
  },
  {
    kicker: "02",
    icon: Recycle,
    title: "Tuần hoàn",
    italic: "Circular by design",
    body: "Một chiếc váy có thể đi qua 30 cô gái khác nhau — đó là cách chúng tôi viết lại định nghĩa về sự dư thừa của thời trang.",
  },
  {
    kicker: "03",
    icon: ShieldCheck,
    title: "An tâm",
    italic: "Quality assured",
    body: "Quy trình vệ sinh chuẩn salon, đóng gói cẩn trọng và bảo hiểm trọn đơn — bạn chỉ việc mặc và tỏa sáng.",
  },
  {
    kicker: "04",
    icon: Heart,
    title: "Đồng hành",
    italic: "By her side",
    body: "Đội ngũ stylist sẵn sàng tư vấn 24/7, giúp bạn tìm được outfit phù hợp cho từng khoảnh khắc trong đời.",
  },
]

const TIMELINE = [
  {
    year: "2022",
    title: "Một tủ đồ chật chội",
    body: "Ý tưởng StyleLoop bắt đầu từ một chiếc tủ đồ chật ních váy áo mặc một lần — và một câu hỏi: tại sao thời trang phải là sở hữu?",
  },
  {
    year: "2023",
    title: "Cộng đồng đầu tiên",
    body: "Ra mắt phiên bản beta với 200 món đồ đến từ 30 cô gái Hà Nội. Trong 90 ngày, hơn 1,200 lượt thuê đã được thực hiện.",
  },
  {
    year: "2024",
    title: "Bước ra toàn quốc",
    body: "Mở rộng đến TP.HCM và Đà Nẵng. Ký kết với 50+ nhà thiết kế Việt để mang những bộ sưu tập độc bản đến gần khách hàng hơn.",
  },
  {
    year: "2026",
    title: "Tủ đồ của 10,000 cô gái",
    body: "Hôm nay, StyleLoop là nơi 10,000+ outfit được luân chuyển mỗi tháng — một vòng tuần hoàn tử tế cho thời trang Việt.",
  },
]

const FOUNDERS = [
  {
    name: "Linh Chi",
    role: "Founder · Creative Director",
    quote: "Phong cách không nằm ở giá tiền — nó nằm ở cách bạn kể câu chuyện của mình.",
    image: "/Home-Img/feedback/image-1.jpg",
    rotation: "rotated-card-1",
    badge: "N°01",
  },
  {
    name: "Minh Anh",
    role: "Co-founder · Operations",
    quote: "Chúng tôi đối xử với mỗi món đồ như cách nâng niu một tác phẩm thủ công.",
    image: "/Home-Img/feedback/image-2.jpg",
    rotation: "rotated-card-2",
    badge: "N°02",
  },
  {
    name: "Thu Hà",
    role: "Co-founder · Brand & Style",
    quote: "Một bộ váy đẹp xứng đáng được mặc nhiều hơn một lần trong đời.",
    image: "/Home-Img/feedback/image-3.jpg",
    rotation: "rotated-card-3",
    badge: "N°03",
  },
]

const PROMISES = [
  {
    icon: Scissors,
    title: "Vệ sinh chuẩn boutique",
    body: "Giặt khô — hấp hơi — kiểm định 5 bước trước mỗi lần giao đến tay bạn.",
  },
  {
    icon: Truck,
    title: "Giao toàn quốc 24h",
    body: "Đối tác vận chuyển ưu tiên đảm bảo đúng ngày cho buổi hẹn quan trọng.",
  },
  {
    icon: Gem,
    title: "Thiết kế độc bản",
    body: "Hơn 60 nhà mốt Việt đồng hành — nhiều món đồ chỉ có duy nhất tại StyleLoop.",
  },
  {
    icon: Leaf,
    title: "Sống xanh, mặc đẹp",
    body: "Mỗi lượt thuê tiết kiệm trung bình 2,700 lít nước so với việc mua mới.",
  },
]

export default function AboutPage() {
  return (
    <div className="w-full overflow-x-clip">
      {/* ─────────── HERO — editorial intro ─────────── */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="bg-cream-hero pointer-events-none absolute inset-0 -z-10" />
        <div aria-hidden className="bg-cream-grid pointer-events-none absolute inset-0 -z-10 opacity-60" />
        <div
          aria-hidden
          className="animate-float-soft pointer-events-none absolute top-24 left-[6%] -z-10 hidden size-72 rounded-full bg-[oklch(0.91_0.026_70/0.5)] blur-3xl lg:block"
        />
        <div
          aria-hidden
          className="animate-drift-alt pointer-events-none absolute right-[6%] bottom-[8%] -z-10 hidden size-80 rounded-full bg-[oklch(0.92_0.024_75/0.55)] blur-3xl lg:block"
          style={{ animationDelay: "-3s" }}
        />

        <div className="relative mx-auto grid w-full grid-cols-1 items-center gap-12 px-6 pt-10 pb-12 lg:max-w-[1200px] lg:grid-cols-2 lg:gap-16 lg:px-12 lg:pt-16 lg:pb-20 xl:max-w-[1535px]">
          {/* LEFT — text */}
          <div className="relative z-10 flex w-full flex-col">
            <div className="flex flex-col gap-3">
              <div className="inline-flex w-fit items-center gap-3">
                <span className="h-px w-8 bg-[oklch(0.6_0.062_60)] lg:w-10" />
                <span className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.5_0.024_60)] uppercase lg:text-[11px] lg:tracking-[0.32em]">
                  About · Est. 2022
                </span>
              </div>
              <p className="font-display text-[11px] font-semibold tracking-[0.32em] text-[oklch(0.34_0.03_55)] uppercase lg:text-[12px] lg:tracking-[0.42em]">
                ✦ Câu chuyện StyleLoop ✦
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2 lg:gap-3">
              <h1 className="font-display text-[40px] leading-[0.98] font-medium tracking-[-0.02em] text-[oklch(0.18_0.014_55)] uppercase lg:text-[72px]">
                Mặc đẹp
              </h1>
              <p className="font-display text-[36px] leading-[0.98] font-medium tracking-[-0.01em] text-[oklch(0.6_0.062_60)] italic lg:text-[72px]">
                không cần sở hữu.
              </p>
            </div>

            <p className="mt-7 max-w-xl text-[15px] leading-[1.85] text-[oklch(0.4_0.024_55)] lg:text-[16px]">
              StyleLoop là{" "}
              <span className="text-[oklch(0.18_0.014_55)] italic">
                tủ đồ tuần hoàn
              </span>{" "}
              của thế hệ phụ nữ trẻ Việt — nơi mỗi cô gái có thể khoác lên mình bộ váy mới mỗi tuần,
              thử nghiệm phong cách, gặp gỡ phiên bản tự tin nhất của chính mình — mà không bị ràng
              buộc bởi giá tiền hay không gian tủ đồ.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/products" className="w-full sm:w-auto">
                <Button className="ribbon-tan group/btn relative isolate h-auto w-full cursor-pointer overflow-hidden rounded-full px-7 py-3.5 text-[11px] font-semibold tracking-[0.22em] uppercase transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-14px_oklch(0.34_0.03_55/0.55)] active:translate-y-0">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-[120%] skew-x-[-18deg] bg-[linear-gradient(90deg,transparent_0%,oklch(0.97_0.012_78/0.35)_45%,oklch(0.97_0.012_78/0.55)_50%,oklch(0.97_0.012_78/0.35)_55%,transparent_100%)] transition-transform duration-[900ms] ease-out group-hover/btn:translate-x-[120%]"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-full opacity-0 ring-1 ring-[oklch(0.97_0.012_78/0.22)] transition-opacity duration-500 ring-inset group-hover/btn:opacity-100"
                  />
                  <span className="relative flex items-center gap-3">
                    Khám phá tủ đồ
                    <ArrowRight className="size-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-1.5" />
                  </span>
                </Button>
              </Link>
              <Link href="/products" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="group/btn2 relative isolate h-auto w-full cursor-pointer overflow-hidden rounded-full border !border-[oklch(0.18_0.014_55)] bg-transparent px-7 py-3.5 text-[11px] font-semibold tracking-[0.22em] text-[oklch(0.18_0.014_55)] uppercase transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-16px_oklch(0.18_0.014_55/0.5)] active:translate-y-0"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 translate-y-full bg-[oklch(0.18_0.014_55)] transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover/btn2:translate-y-0"
                  />
                  <span className="relative flex items-center gap-3 transition-colors duration-500 group-hover/btn2:text-[oklch(0.97_0.012_78)]">
                    Cho thuê đồ của bạn
                    <Heart className="size-4 transition-all duration-500 ease-out group-hover/btn2:scale-110 group-hover/btn2:fill-[oklch(0.6_0.062_60)] group-hover/btn2:stroke-[oklch(0.6_0.062_60)]" />
                  </span>
                </Button>
              </Link>
            </div>

            {/* mini stats */}
            <div className="mt-12 grid grid-cols-3 divide-x divide-[oklch(0.86_0.018_70)] border-y border-[oklch(0.86_0.018_70)] py-5">
              {[
                { num: "10k+", label: "Outfits" },
                { num: "60+", label: "Nhà thiết kế" },
                { num: "3", label: "Thành phố" },
              ].map((s) => (
                <div key={s.label} className="px-3 text-center lg:px-6">
                  <p className="font-display text-2xl font-medium tracking-tight text-[oklch(0.18_0.014_55)] lg:text-3xl">
                    {s.num}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.5_0.024_60)] uppercase">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — editorial collage */}
          <div className="relative flex h-[480px] w-full items-center justify-center lg:h-[640px]">
            <div
              aria-hidden
              className="animate-blob absolute inset-0 m-auto size-[80%] bg-[oklch(0.86_0.034_70/0.55)] opacity-70 blur-2xl"
            />

            <div className="relative size-full max-w-xl">
              {/* Frame 1 — top left */}
              <div className="rotated-card-1 absolute top-4 left-0 z-10 h-2/3 w-3/5 overflow-hidden rounded-sm bg-[oklch(0.99_0.008_78)] p-2.5 pb-9 shadow-[0_30px_60px_-30px_oklch(0.34_0.03_55/0.55)] ring-1 ring-[oklch(0.86_0.018_70)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Home-Img/image-1.png"
                  alt="StyleLoop atelier moment"
                  className="size-full object-cover grayscale-[0.05]"
                />
                <div className="absolute right-3 bottom-2 left-3 flex items-center justify-between">
                  <span className="font-display text-[10px] tracking-[0.22em] text-[oklch(0.34_0.03_55)] uppercase">
                    Atelier
                  </span>
                  <span className="text-[10px] tracking-[0.22em] text-[oklch(0.6_0.062_60)] uppercase">
                    N°01
                  </span>
                </div>
              </div>

              {/* Frame 2 — bottom right */}
              <div className="rotated-card-2 absolute right-0 bottom-6 z-20 h-3/5 w-3/5 overflow-hidden rounded-sm bg-[oklch(0.99_0.008_78)] p-2.5 pb-9 shadow-[0_30px_60px_-30px_oklch(0.34_0.03_55/0.55)] ring-1 ring-[oklch(0.86_0.018_70)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Home-Img/image-10.jpg"
                  alt="Curated wardrobe rail"
                  className="size-full object-cover grayscale-[0.08]"
                />
                <div className="absolute top-3 right-3 rounded-full bg-[oklch(0.18_0.014_55)] px-3 py-1 text-[10px] tracking-[0.22em] text-[oklch(0.97_0.012_78)] uppercase">
                  Since 2022
                </div>
                <div className="absolute right-3 bottom-2 left-3 flex items-center justify-between">
                  <span className="font-display text-[10px] tracking-[0.22em] text-[oklch(0.34_0.03_55)] uppercase">
                    The Loop
                  </span>
                  <span className="text-[10px] tracking-[0.22em] text-[oklch(0.6_0.062_60)] uppercase">
                    N°02
                  </span>
                </div>
              </div>

              {/* Frame 3 — center floating */}
              <div className="rotated-card-3 absolute top-[42%] left-[44%] z-30 h-[44%] w-[42%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-sm bg-[oklch(0.99_0.008_78)] p-2.5 pb-9 shadow-[0_36px_70px_-30px_oklch(0.34_0.03_55/0.6)] ring-1 ring-[oklch(0.86_0.018_70)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Home-Img/image-2.png"
                  alt="Editorial portrait"
                  className="size-full object-cover grayscale-[0.05]"
                />
                <div className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-[oklch(0.99_0.008_78)] shadow-md">
                  <Sparkles className="size-3.5 fill-[oklch(0.78_0.04_70)] stroke-[oklch(0.6_0.062_60)]" />
                </div>
                <p className="absolute bottom-1.5 left-1/2 -translate-x-1/2 font-display text-[10px] tracking-[0.32em] text-[oklch(0.6_0.062_60)] uppercase">
                  Manifesto
                </p>
              </div>

              {/* Decorations */}
              <Star
                className="animate-twinkle absolute top-2 right-12 size-6 fill-[oklch(0.78_0.04_70)] stroke-[oklch(0.6_0.062_60)]"
                style={{ animationDelay: "0.4s" }}
              />
              <Sparkles
                className="animate-float-soft absolute -bottom-2 left-2 size-9 fill-[oklch(0.86_0.034_70)] stroke-[oklch(0.6_0.062_60)]"
                style={{ ["--spin" as string]: "-8deg" } as React.CSSProperties}
              />
            </div>
          </div>
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
              <span>✦ Wear more · own less</span>
              <span className="tracking-[0.08em] text-[oklch(0.6_0.062_60)] normal-case italic">
                The editorial wardrobe
              </span>
              <span>✧ Mỗi món đồ · một câu chuyện</span>
              <span className="tracking-[0.08em] text-[oklch(0.6_0.062_60)] normal-case italic">
                style on repeat
              </span>
              <span>✦ Tuần hoàn · tử tế · Việt</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────── MANIFESTO — dark espresso ─────────── */}
      <section className="relative overflow-hidden bg-[oklch(0.18_0.014_55)] text-[oklch(0.94_0.014_75)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_15%_30%,oklch(0.4_0.05_60/0.45),transparent_70%),radial-gradient(ellipse_55%_45%_at_85%_75%,oklch(0.6_0.062_60/0.25),transparent_72%)] opacity-50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,oklch(0.6_0.062_60/0.6),transparent)]"
        />

        <div className="relative mx-auto grid grid-cols-1 items-center gap-10 px-6 py-12 lg:max-w-[1200px] lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:px-12 lg:py-20 xl:max-w-[1535px]">
          {/* LEFT — text */}
          <div className="relative order-2 space-y-8 lg:order-1">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[oklch(0.78_0.04_70)] lg:w-10" />
              <span className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.78_0.04_70)] uppercase lg:text-[11px] lg:tracking-[0.32em]">
                ✦ Manifesto ✦
              </span>
            </div>

            <h2 className="font-display text-[28px] leading-[1.1] font-medium tracking-[-0.01em] text-[oklch(0.97_0.012_78)] lg:text-[56px] lg:leading-[1.05]">
              Chúng tôi tin rằng{" "}
              <span className="text-[oklch(0.86_0.034_70)] italic">
                vẻ đẹp không nên
              </span>{" "}
              chỉ thuộc về một người.
            </h2>

            <div className="relative">
              <Quote
                className="absolute -top-4 -left-4 size-12 fill-[oklch(0.6_0.062_60/0.18)] stroke-none"
                strokeWidth={1.4}
              />
              <p className="relative pl-2 text-[15px] leading-[1.95] text-[oklch(0.82_0.018_70)] lg:text-[16px]">
                Mỗi chiếc váy treo lặng lẽ trong tủ là một câu chuyện chưa được kể tiếp.
                Mỗi outfit chỉ mặc một lần là một mảnh khí hậu trả giá. StyleLoop ra đời
                để biến tủ đồ của bạn thành một{" "}
                <span className="text-[oklch(0.86_0.034_70)] italic">
                  vòng tròn tử tế
                </span>{" "}
                — nơi vẻ đẹp được luân chuyển, được trân trọng, được sống nhiều cuộc đời.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-3">
              {[
                { kicker: "01", title: "Sustain", caption: "Mặc nhiều — bỏ ít." },
                { kicker: "02", title: "Style", caption: "Phong cách không bị giới hạn." },
                { kicker: "03", title: "Share", caption: "Cộng đồng cùng tỏa sáng." },
              ].map((item) => (
                <div
                  key={item.kicker}
                  className="space-y-2 border-t border-[oklch(0.4_0.024_55)] pt-4"
                >
                  <p className="font-display text-[13px] tracking-[0.32em] text-[oklch(0.78_0.04_70)] uppercase">
                    {item.kicker}
                  </p>
                  <p className="font-display text-lg font-medium text-[oklch(0.97_0.012_78)]">
                    {item.title}
                  </p>
                  <p className="text-[12px] leading-relaxed text-[oklch(0.78_0.018_70)]">
                    {item.caption}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — image */}
          <div className="relative order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Home-Img/image-3.png"
                alt="StyleLoop curator at work"
                className="aspect-[4/5] w-full object-cover grayscale-[0.18]"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-[oklch(0.18_0.014_55/0.55)] via-transparent to-transparent"
              />
              <div className="absolute right-5 bottom-5 left-5 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.32em] text-[oklch(0.78_0.04_70)] uppercase">
                    Manifesto · 26
                  </p>
                  <p className="mt-1 font-display text-xl tracking-tight text-[oklch(0.97_0.012_78)]">
                    Wear · Return · Repeat
                  </p>
                </div>
                <span className="font-display text-[11px] tracking-[0.32em] text-[oklch(0.86_0.034_70)] uppercase">
                  Pg. 02
                </span>
              </div>
            </div>
            <span className="absolute -top-4 -right-4 hidden font-display text-[140px] leading-none font-medium text-[oklch(0.6_0.062_60/0.18)] italic lg:block">
              S
            </span>
          </div>
        </div>
      </section>

      {/* ─────────── PILLARS — values 4 cards ─────────── */}
      <section className="relative overflow-hidden bg-[oklch(0.965_0.012_78)]">
        <div aria-hidden className="bg-cream-warm pointer-events-none absolute inset-0" />
        <div
          aria-hidden
          className="bg-halftone-tan pointer-events-none absolute inset-x-0 top-12 mx-auto h-[400px] max-w-5xl opacity-30"
        />
        <div className="relative mx-auto px-6 py-12 lg:max-w-[1200px] lg:px-12 lg:py-20 xl:max-w-[1535px]">
          <div className="mb-10 flex flex-col items-center gap-5 text-center lg:mb-14">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[oklch(0.6_0.062_60)] lg:w-10" />
              <span className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.5_0.024_60)] uppercase lg:text-[11px] lg:tracking-[0.32em]">
                ✦ Bốn cột trụ ✦
              </span>
              <span className="h-px w-8 bg-[oklch(0.6_0.062_60)] lg:w-10" />
            </div>
            <h2 className="font-display text-[30px] leading-[1.05] font-medium tracking-[-0.01em] text-[oklch(0.18_0.014_55)] lg:text-[52px]">
              Những giá trị mà chúng tôi{" "}
              <span className="text-[oklch(0.6_0.062_60)] italic">không bao giờ thỏa hiệp</span>
            </h2>
            <p className="max-w-md text-[14px] leading-relaxed text-[oklch(0.5_0.024_60)]">
              Bốn cam kết làm nên định nghĩa của StyleLoop — từ ngày đầu tiên, đến hôm nay.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {PILLARS.map((p) => {
              const Icon = p.icon
              return (
                <article
                  key={p.kicker}
                  className="group relative flex flex-col gap-5 rounded-md bg-[oklch(0.99_0.008_78)] p-6 ring-1 ring-[oklch(0.86_0.018_70)] shadow-[0_18px_40px_-22px_oklch(0.34_0.03_55/0.35)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_60px_-22px_oklch(0.34_0.03_55/0.5)] lg:p-7"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-full bg-[oklch(0.94_0.014_75)] ring-1 ring-[oklch(0.86_0.018_70)] transition-colors duration-500 group-hover:bg-[oklch(0.18_0.014_55)] group-hover:ring-[oklch(0.18_0.014_55)]">
                      <Icon
                        className="size-5 text-[oklch(0.6_0.062_60)] transition-colors duration-500 group-hover:text-[oklch(0.86_0.034_70)]"
                        strokeWidth={1.4}
                      />
                    </div>
                    <span className="font-display text-[11px] tracking-[0.32em] text-[oklch(0.78_0.04_70)] uppercase">
                      {p.kicker}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-[22px] font-medium tracking-tight text-[oklch(0.18_0.014_55)]">
                      {p.title}
                    </h3>
                    <p className="font-display text-[13px] tracking-tight text-[oklch(0.6_0.062_60)] italic">
                      {p.italic}
                    </p>
                  </div>
                  <p className="text-[13.5px] leading-[1.75] text-[oklch(0.5_0.024_60)]">
                    {p.body}
                  </p>
                  <div
                    aria-hidden
                    className="dashed-border h-px w-full opacity-50 transition-opacity duration-500 group-hover:opacity-100"
                  />
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─────────── BIG NUMBERS — stats strip ─────────── */}
      <section className="relative overflow-hidden border-y border-[oklch(0.86_0.018_70)] bg-[oklch(0.94_0.014_75)]">
        <div
          aria-hidden
          className="bg-cream-grid pointer-events-none absolute inset-0 opacity-40"
        />
        <div className="relative mx-auto grid grid-cols-2 gap-y-12 px-6 py-10 lg:max-w-[1200px] lg:grid-cols-4 lg:gap-12 lg:px-12 lg:py-14 xl:max-w-[1535px]">
          {[
            { num: "10,000+", label: "Outfit luân chuyển", sub: "mỗi tháng" },
            { num: "60+", label: "Nhà thiết kế Việt", sub: "đồng hành" },
            { num: "4.9", label: "Đánh giá khách hàng", sub: "★ trên 5" },
            { num: "2.7M", label: "Lít nước tiết kiệm", sub: "từ 2022 đến nay" },
          ].map((s, i) => (
            <div
              key={s.label}
              className="relative flex flex-col items-center text-center lg:items-start lg:text-left"
            >
              <span className="font-display text-[10px] tracking-[0.32em] text-[oklch(0.6_0.062_60)] uppercase">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-3 font-display text-5xl font-medium tracking-[-0.02em] text-[oklch(0.18_0.014_55)] lg:text-[68px]">
                {s.num}
              </p>
              <p className="mt-2 font-display text-[14px] font-medium tracking-tight text-[oklch(0.18_0.014_55)] lg:text-[15px]">
                {s.label}
              </p>
              <p className="mt-1 text-[11px] tracking-[0.18em] text-[oklch(0.5_0.024_60)] uppercase">
                {s.sub}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── JOURNEY — timeline ─────────── */}
      <section className="relative overflow-hidden bg-[oklch(0.965_0.012_78)]">
        <div aria-hidden className="bg-cream-soft pointer-events-none absolute inset-0" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-[12%] -z-0 size-72 rounded-full bg-[oklch(0.91_0.026_70/0.4)] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[10%] -bottom-24 -z-0 size-80 rounded-full bg-[oklch(0.92_0.024_75/0.5)] blur-3xl"
        />

        <div className="relative mx-auto px-6 py-12 lg:max-w-[1200px] lg:px-12 lg:py-20 xl:max-w-[1535px]">
          <div className="mb-10 grid grid-cols-1 items-end gap-6 lg:mb-14 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-[oklch(0.6_0.062_60)] lg:w-10" />
                <span className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.5_0.024_60)] uppercase lg:text-[11px] lg:tracking-[0.32em]">
                  ✦ Hành trình ✦
                </span>
              </div>
              <h2 className="font-display text-[30px] leading-[1.05] font-medium tracking-[-0.01em] text-[oklch(0.18_0.014_55)] lg:text-[52px]">
                Bốn năm,{" "}
                <span className="text-[oklch(0.6_0.062_60)] italic">một vòng tuần hoàn</span>
              </h2>
            </div>
            <p className="max-w-lg text-[14px] leading-[1.85] text-[oklch(0.5_0.024_60)] lg:text-[15px] lg:justify-self-end">
              Từ một ý tưởng nhỏ trong căn phòng 18m² ở Hà Nội đến cộng đồng hơn 50,000 cô gái —
              đây là cách StyleLoop đã lớn lên cùng các bạn.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* center vertical line — desktop only */}
            <div
              aria-hidden
              className="absolute top-0 bottom-0 left-6 hidden w-px bg-[radial-gradient(circle,oklch(0.78_0.04_70)_1px,transparent_1.5px)] [background-size:2px_12px] lg:left-1/2 lg:block"
            />

            <ol className="space-y-8 lg:space-y-12">
              {TIMELINE.map((step, idx) => {
                const right = idx % 2 === 1
                return (
                  <li key={step.year} className="relative">
                    {/* Mobile vertical rail */}
                    <div
                      aria-hidden
                      className="absolute top-2 bottom-0 left-6 w-px bg-[radial-gradient(circle,oklch(0.78_0.04_70)_1px,transparent_1.5px)] [background-size:2px_12px] lg:hidden"
                    />

                    <div
                      className={`grid grid-cols-1 items-start gap-5 lg:grid-cols-2 lg:gap-12 ${
                        right ? "lg:[&>*:first-child]:order-2" : ""
                      }`}
                    >
                      {/* Year + dot */}
                      <div
                        className={`relative flex items-center gap-5 lg:gap-6 ${
                          right ? "lg:flex-row-reverse lg:text-right lg:justify-self-start lg:pl-12" : "lg:pr-12 lg:justify-self-end"
                        }`}
                      >
                        {/* dot */}
                        <span
                          aria-hidden
                          className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full bg-[oklch(0.18_0.014_55)] ring-4 ring-[oklch(0.965_0.012_78)] lg:size-14"
                          style={{
                            marginLeft: right ? undefined : 0,
                          }}
                        >
                          <Compass
                            className="size-5 text-[oklch(0.86_0.034_70)] lg:size-6"
                            strokeWidth={1.4}
                          />
                        </span>
                        <div>
                          <p className="font-display text-[11px] tracking-[0.32em] text-[oklch(0.6_0.062_60)] uppercase">
                            Chương {String(idx + 1).padStart(2, "0")}
                          </p>
                          <p className="font-display text-5xl font-medium tracking-[-0.02em] text-[oklch(0.18_0.014_55)] lg:text-[80px]">
                            {step.year}
                          </p>
                        </div>
                      </div>

                      {/* Body card */}
                      <div
                        className={`relative ml-16 rounded-md bg-[oklch(0.99_0.008_78)] p-6 ring-1 ring-[oklch(0.86_0.018_70)] shadow-[0_18px_40px_-22px_oklch(0.34_0.03_55/0.35)] lg:ml-0 lg:p-8 ${
                          right ? "lg:mr-12" : "lg:ml-12"
                        }`}
                      >
                        <h3 className="font-display text-[22px] font-medium tracking-tight text-[oklch(0.18_0.014_55)] lg:text-[26px]">
                          {step.title}
                        </h3>
                        <p className="mt-3 text-[13.5px] leading-[1.85] text-[oklch(0.5_0.024_60)] lg:text-[14.5px]">
                          {step.body}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* ─────────── FOUNDERS — collage cards ─────────── */}
      <section className="relative overflow-hidden bg-[oklch(0.965_0.012_78)]">
        <div aria-hidden className="bg-cream-warm pointer-events-none absolute inset-0" />
        <div className="relative mx-auto px-6 py-12 lg:max-w-[1200px] lg:px-12 lg:py-20 xl:max-w-[1535px]">
          <div className="mb-10 flex flex-col items-center gap-5 text-center lg:mb-14">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[oklch(0.6_0.062_60)] lg:w-10" />
              <span className="text-[10px] font-semibold tracking-[0.24em] text-[oklch(0.5_0.024_60)] uppercase lg:text-[11px] lg:tracking-[0.32em]">
                ✦ Sáng lập ✦
              </span>
              <span className="h-px w-8 bg-[oklch(0.6_0.062_60)] lg:w-10" />
            </div>
            <h2 className="font-display text-[30px] leading-[1.05] font-medium tracking-[-0.01em] text-[oklch(0.18_0.014_55)] lg:text-[52px]">
              Ba cô gái,{" "}
              <span className="text-[oklch(0.6_0.062_60)] italic">một giấc mơ chung</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {FOUNDERS.map((f, idx) => (
              <article key={f.name} className="group relative flex flex-col">
                {/* Photo card */}
                <div
                  className={`${f.rotation} relative overflow-hidden rounded-sm bg-[oklch(0.99_0.008_78)] p-2.5 pb-12 shadow-[0_28px_56px_-26px_oklch(0.34_0.03_55/0.5)] ring-1 ring-[oklch(0.86_0.018_70)] transition-transform duration-500 group-hover:rotate-0`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.image}
                    alt={f.name}
                    className="aspect-[3/4] w-full object-cover grayscale-[0.1]"
                  />
                  <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between">
                    <span className="font-display text-[10px] tracking-[0.32em] text-[oklch(0.34_0.03_55)] uppercase">
                      Founder
                    </span>
                    <span className="text-[10px] tracking-[0.32em] text-[oklch(0.6_0.062_60)] uppercase">
                      {f.badge}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3 px-2">
                  <span className="font-display text-[11px] tracking-[0.32em] text-[oklch(0.6_0.062_60)] uppercase">
                    Chapter {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-[26px] font-medium tracking-tight text-[oklch(0.18_0.014_55)] lg:text-[30px]">
                    {f.name}
                  </h3>
                  <p className="text-[12px] tracking-[0.18em] text-[oklch(0.5_0.024_60)] uppercase">
                    {f.role}
                  </p>
                  <p className="relative pt-2 text-[14px] leading-[1.85] text-[oklch(0.4_0.024_55)] italic">
                    <Quote
                      className="absolute -top-1 -left-1 size-4 fill-[oklch(0.6_0.062_60/0.4)] stroke-none"
                      strokeWidth={1.4}
                    />
                    <span className="pl-4">{f.quote}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── PROMISES — why us ─────────── */}
      <section className="relative overflow-hidden bg-[oklch(0.94_0.014_75)]">
        <div
          aria-hidden
          className="bg-tan-stripes pointer-events-none absolute inset-0 opacity-40"
        />
        <div className="relative mx-auto px-6 py-12 lg:max-w-[1200px] lg:px-12 lg:py-20 xl:max-w-[1535px]">
          <div className="mb-10 grid grid-cols-1 gap-8 lg:mb-14 lg:grid-cols-[1fr_1.2fr] lg:items-end lg:gap-16">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-[oklch(0.6_0.062_60)] lg:w-10" />
                <span className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.5_0.024_60)] uppercase lg:text-[11px] lg:tracking-[0.32em]">
                  ✦ Lời cam kết ✦
                </span>
              </div>
              <h2 className="font-display text-[30px] leading-[1.05] font-medium tracking-[-0.01em] text-[oklch(0.18_0.014_55)] lg:text-[52px]">
                Bốn lời hứa{" "}
                <span className="text-[oklch(0.6_0.062_60)] italic">từ trái tim</span>
              </h2>
            </div>
            <p className="max-w-xl text-[14px] leading-[1.85] text-[oklch(0.5_0.024_60)] lg:text-[15px]">
              StyleLoop không chỉ là nơi cho thuê đồ. Đó là một trải nghiệm được dệt nên từ
              sự tử tế trong từng chi tiết — từ chiếc nơ buộc trên hộp đến lời nhắn tay viết
              mà bạn nhận được.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2">
            {PROMISES.map((p, idx) => {
              const Icon = p.icon
              return (
                <div
                  key={p.title}
                  className="group flex items-start gap-5 border-b border-[oklch(0.86_0.018_70)] py-7 transition-colors duration-300 last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0 lg:py-8"
                >
                  <div className="flex shrink-0 items-center gap-4">
                    <span className="font-display text-[14px] tracking-[0.32em] text-[oklch(0.6_0.062_60)] uppercase">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="flex size-12 items-center justify-center rounded-full bg-[oklch(0.99_0.008_78)] ring-1 ring-[oklch(0.86_0.018_70)] transition-all duration-500 group-hover:bg-[oklch(0.18_0.014_55)] group-hover:ring-[oklch(0.18_0.014_55)]">
                      <Icon
                        className="size-5 text-[oklch(0.6_0.062_60)] transition-colors duration-500 group-hover:text-[oklch(0.86_0.034_70)]"
                        strokeWidth={1.4}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-[20px] font-medium tracking-tight text-[oklch(0.18_0.014_55)] lg:text-[22px]">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-[1.75] text-[oklch(0.5_0.024_60)] lg:text-[14px]">
                      {p.body}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─────────── EDITORIAL QUOTE ─────────── */}
      <section className="relative overflow-hidden bg-[oklch(0.18_0.014_55)] py-16 text-[oklch(0.94_0.014_75)] lg:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,oklch(0.6_0.062_60/0.18),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Quote
            className="mx-auto size-10 fill-[oklch(0.6_0.062_60)] stroke-none lg:size-14"
            strokeWidth={1.2}
          />
          <p className="mt-8 font-display text-[26px] leading-[1.45] font-medium tracking-tight text-[oklch(0.97_0.012_78)] lg:text-[40px]">
            “Thời trang sẽ bền vững khi mỗi bộ váy đẹp được sống{" "}
            <span className="text-[oklch(0.86_0.034_70)] italic">nhiều hơn một mùa</span>{" "}
            — và mỗi cô gái được tự do trở thành{" "}
            <span className="text-[oklch(0.86_0.034_70)] italic">phiên bản mới</span> mỗi ngày.”
          </p>
          <div className="mt-10 flex flex-col items-center gap-2">
            <span className="text-[10px] font-semibold tracking-[0.24em] text-[oklch(0.78_0.04_70)] uppercase lg:tracking-[0.32em]">
              ✦ StyleLoop Manifesto ✦
            </span>
            <span className="font-display text-[14px] text-[oklch(0.86_0.034_70)] italic">
              Estd. 2022 · Hà Nội
            </span>
          </div>
        </div>
      </section>

      {/* ─────────── CTA ─────────── */}
      <section className="relative overflow-hidden bg-[oklch(0.965_0.012_78)]">
        <div aria-hidden className="bg-cream-hero pointer-events-none absolute inset-0" />
        <div
          aria-hidden
          className="bg-halftone-tan pointer-events-none absolute inset-0 opacity-40"
        />

        <div className="relative mx-auto grid grid-cols-1 gap-10 px-6 py-12 lg:max-w-[1200px] lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:px-12 lg:py-20 xl:max-w-[1535px]">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[oklch(0.6_0.062_60)] lg:w-10" />
              <span className="text-[10px] font-semibold tracking-[0.24em] text-[oklch(0.5_0.024_60)] uppercase lg:text-[11px] lg:tracking-[0.32em]">
                ✦ Bắt đầu ngay ✦
              </span>
            </div>
            <h2 className="font-display text-[32px] leading-[1.02] font-medium tracking-[-0.02em] text-[oklch(0.18_0.014_55)] lg:text-[60px]">
              Sẵn sàng cho{" "}
              <span className="text-[oklch(0.6_0.062_60)] italic">vòng tủ đồ</span>
              <br />
              của riêng bạn?
            </h2>
            <p className="max-w-xl text-[15px] leading-[1.85] text-[oklch(0.5_0.024_60)]">
              Tạo tài khoản chỉ trong 30 giây — và mở ra một tủ đồ với hơn 10,000 món đồ
              được tuyển chọn riêng cho bạn.
            </p>

            <CtaButtons />
          </div>

          {/* Contact card */}
          <div className="relative">
            <div className="relative rounded-md bg-[oklch(0.18_0.014_55)] p-8 text-[oklch(0.94_0.014_75)] shadow-[0_30px_60px_-26px_oklch(0.18_0.014_55/0.6)] lg:p-10">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-md bg-[radial-gradient(ellipse_60%_60%_at_15%_15%,oklch(0.6_0.062_60/0.25),transparent_70%)]"
              />
              <div className="relative space-y-7">
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-[oklch(0.78_0.04_70)] lg:w-10" />
                  <span className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.78_0.04_70)] uppercase lg:text-[11px] lg:tracking-[0.32em]">
                    ✦ Ghé thăm ✦
                  </span>
                </div>
                <h3 className="font-display text-[28px] leading-tight font-medium tracking-tight text-[oklch(0.97_0.012_78)] lg:text-[34px]">
                  Studio của
                  <br />
                  <span className="text-[oklch(0.86_0.034_70)] italic">StyleLoop.</span>
                </h3>

                <ul className="space-y-5">
                  {[
                    {
                      icon: MapPin,
                      label: "Showroom Hà Nội",
                      value: "Số 18, Ngõ 88 Trần Duy Hưng, Cầu Giấy",
                    },
                    {
                      icon: Phone,
                      label: "Hotline",
                      value: "(+84) 28 7300 1234",
                    },
                    {
                      icon: Mail,
                      label: "Email",
                      value: "hello@styleloop.vn",
                    },
                  ].map((c) => {
                    const Icon = c.icon
                    return (
                      <li key={c.label} className="flex items-start gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[oklch(0.4_0.028_55)] ring-1 ring-[oklch(0.4_0.028_55)]">
                          <Icon
                            className="size-4 text-[oklch(0.86_0.034_70)]"
                            strokeWidth={1.4}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.78_0.04_70)] uppercase">
                            {c.label}
                          </p>
                          <p className="mt-1 font-display text-[15px] text-[oklch(0.97_0.012_78)]">
                            {c.value}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>

                <div className="dashed-border h-px w-full opacity-60" />

                <div className="flex items-center gap-4">
                  <Hand
                    className="size-5 text-[oklch(0.86_0.034_70)]"
                    strokeWidth={1.4}
                  />
                  <p className="font-display text-[13px] tracking-tight text-[oklch(0.86_0.034_70)] italic">
                    Mở cửa: 09:00 — 21:00, mọi ngày trong tuần
                  </p>
                </div>
              </div>
            </div>

            {/* small floating badge */}
            <span className="absolute -top-5 -right-5 hidden size-24 rotate-[-8deg] items-center justify-center rounded-full bg-[oklch(0.6_0.062_60)] text-center font-display text-[10px] font-semibold tracking-[0.32em] text-[oklch(0.97_0.012_78)] uppercase shadow-[0_18px_40px_-14px_oklch(0.34_0.03_55/0.55)] lg:flex">
              Estd
              <br />
              2022
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
