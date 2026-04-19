import {
  ArrowRight,
  RefreshCw,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Heart,
  Leaf,
  Package,
  PiggyBank,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react"

import { ProductCard, type ProductCardProps } from "@/components/product-card"
import {
  CategoryCard,
  type CategoryCardProps,
} from "@/components/category-card"
import { StepCard, type StepCardProps } from "@/components/step-card"
import {
  TestimonialCard,
  type TestimonialCardProps,
} from "@/components/testimonial-card"
import { Button } from "@/components/ui/button"

const STEPS: StepCardProps[] = [
  {
    index: 1,
    title: "Khám phá",
    description: "Tìm kiếm hàng nghìn món đồ từ tủ đồ của cộng đồng bạn bè.",
    icon: Search,
    tone: "primary",
  },
  {
    index: 2,
    title: "Đặt thuê",
    description: "Chọn ngày bạn cần và thanh toán nhanh chóng chỉ trong 30s.",
    icon: CalendarDays,
    tone: "secondary",
  },
  {
    index: 3,
    title: "Nhận đồ",
    description: "Đồ được giao tận nơi, đã giặt là sạch sẽ, thơm tho.",
    icon: Package,
    tone: "tertiary",
  },
  {
    index: 4,
    title: "Trả lại",
    description: "Gửi lại đồ sau khi dùng — phần còn lại cứ để StyleLoop lo.",
    icon: RefreshCw,
    tone: "muted",
  },
]

const CATEGORIES: CategoryCardProps[] = [
  {
    name: "Váy dự tiệc",
    itemCount: "1.2k+ món",
    accent: "pink",
    image: "/Home-Img/img-danh-muc/image-5.webp",
    imageAlt: "Elegant evening gown with sequin details",
  },
  {
    name: "Áo croptop",
    itemCount: "850+ món",
    accent: "peach",
    image: "/Home-Img/img-danh-muc/image-2.png",
    imageAlt: "Trendy crop top and denim outfit",
  },
  {
    name: "Đồ đi biển",
    itemCount: "540+ món",
    accent: "mint",
    image: "/Home-Img/img-danh-muc/image-1.webp",
    imageAlt: "Beach cover-up on sunny deck",
  },
  {
    name: "Y2K Style",
    itemCount: "2.1k+ món",
    accent: "lilac",
    image: "/Home-Img/img-danh-muc/image-3.webp",
    imageAlt: "Oversized streetwear under neon lights",
  },
  {
    name: "Vintage 90s",
    itemCount: "930+ món",
    accent: "butter",
    image: "/Home-Img/img-danh-muc/image-4.webp",
    imageAlt: "Vintage floral dress with nostalgic mood",
  },
]

const PRODUCTS: ProductCardProps[] = [
  {
    title: "Váy hai dây hoa nhí vintage",
    pricePerDay: "50.000đ/ngày",
    image: "/Home-Img/item-hot/image-1.jpg",
    imageAlt: "Dainty vintage floral sundress",
    owner: {
      handle: "@minhchau.closet",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAGoRLOSPBo3mE3p7pgOCi7aSLZ5txldb_-EKyGD20CCNLfmfPeJj1v30f7JZ0UxBY0F5ay4zlUAy-iYz_DYtLguB-GZp6zugbO0QYdvwIGjiRrwG5gghfehI5jvk6xmQ1YcX4KknQzvi6WijThtPO9fq1BirWRCe3y2P4Edgf_z8JFwcslf6qcSfRm6GeTw4wKAgHlA4-xn3HCXk74U9xcFJ9w5dGjYhphgU4JgBGioLY-N_IfeRMgNgNLIG8FYaT7ZZtpT-temE0",
      location: "Quận 3",
    },
    rating: 4.9,
    availability: { label: "Còn trống từ 20/4", tone: "success" },
  },
  {
    title: "Set Blazer Lilac hiện đại",
    pricePerDay: "120.000đ/ngày",
    image: "/Home-Img/item-hot/image-2.jpg",
    imageAlt: "Stylish lilac blazer set",
    owner: {
      handle: "@tlinh.rent",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDfbvTIEroHE2wcVmxOFXWhWUvqiy_5Xecg7lLPD2NGjwMFbajW7Wf1Cn4YUlf5HdUFFVRaUwaG8j2yoU0ipsJyOp9OwvnRNYckfVQ9aBx9OdT-6vUYFgXXwtyHyW6zo94UlEyDMih0jNnZXqm5yQzV_ZlUfB0_zQOdrpPMG8eWb_47TpS9U3rf_6PwKMmKaqfnXV4xvX57HY1tWTQoduXchV0DgLwaSxl0Tanqp1VhaCwkDW56nfAO1aXRHHTVQdxmhGbvMLVL0ng",
      location: "Đống Đa",
    },
    rating: 5.0,
    availability: { label: "Sẵn sàng ngay", tone: "success" },
  },
  {
    title: "Đầm lụa Champagne dự tiệc",
    pricePerDay: "200.000đ/ngày",
    image: "/Home-Img/item-hot/image-3.jpg",
    imageAlt: "Luxurious silk slip dress",
    owner: {
      handle: "@luxury.closet",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAuBPllCk5lo5BV6GkkonXg-w79mV3MsHOB0lq9jA7WKUL6sHBVl6l0Z-MSRN4BoJxGLnVxiSLGSc-B88PLyXfTKn2xMYnvS7UdlSwh5YGh8-8ZaslV8sV_UUGCG_itf7L1X9rKAaQyvSl-wk9rqVUyTRjG4QAK3dKfB7u18MDNEwteEKE7DZpqM26dqekVjunl51WA2LmaiLQM5oesc8cuRJpAXfyLIx5eJFIAL8uWbj1fFr9UMPRKVYljVHQ9DBt0SS1XlXEGFxo",
      location: "Quận 1",
    },
    rating: 4.8,
    availability: { label: "Chỉ còn 1 chiếc", tone: "danger" },
  },
  {
    title: "Top bướm denim Y2K",
    pricePerDay: "45.000đ/ngày",
    image: "/Home-Img/item-hot/image-4.jpg",
    imageAlt: "Y2K denim butterfly top",
    owner: {
      handle: "@genz.vibes",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCl4XYyns_UQe5aOEDQJJ2lNlk5uKew-M38lSJ6knxIVRLaQGAPWCPyRLC5dibsuM2aYz0mT61ycv5GJkvIdVfr143IH_9oHQESuvQTXeA4GnQ5rZC_8wNWM5JEokpNwJOmNLY3RGoQulBGo-zabGFloE9ZR0yZp9LccQr9erMdr6WaIFG74G6c9jbSLAgWqqb2aj40mdaLlC4vMXmE2V2fwbqkMDuSBjWeWg1DhVwacmnmFfQTgTxBDZlsY_Ay0wR31VPSsk",
      location: "Quận 7",
    },
    rating: 4.7,
    availability: { label: "Còn trống 25/4", tone: "success" },
  },
]

const TESTIMONIALS: TestimonialCardProps[] = [
  {
    quote:
      "Rất bất ngờ về chất lượng đồ, thuê chiếc váy dự tiệc chỉ với 1/10 giá mua!",
    author: "@lyly.dang",
    accent: "pink",
    image: "/Home-Img/feedback/image-1.jpg",
    imageAlt: "User in rented floral dress",
    rotation: "rotated-card-1",
  },
  {
    quote: "StyleLoop giúp mình có thêm một khoản thu nhập thụ động mỗi tháng.",
    author: "@hoang.minh",
    accent: "mint",
    image: "/Home-Img/feedback/image-2.jpg",
    imageAlt: "Young man in rented designer jacket",
    rotation: "rotated-card-2",
  },
  {
    quote:
      "Ứng dụng cứu cánh cho những buổi đi event gấp gáp mà chưa kịp mua đồ mới!",
    author: "@trang.le",
    accent: "peach",
    image: "/Home-Img/feedback/image-3.jpg",
    imageAlt: "Trendy outfit in chic cafe",
    rotation: "rotated-card-3",
  },
]

export default function HomePage() {
  return (
    <>
      {/* ─────────── HERO ─────────── */}
      <section className="relative flex w-full flex-col items-center overflow-hidden lg:min-h-[760px] lg:flex-row">
        <div
          aria-hidden
          className="bg-cream-hero pointer-events-none absolute inset-0 -z-10"
        />
        <div
          aria-hidden
          className="bg-cream-grid pointer-events-none absolute inset-0 -z-10 opacity-60"
        />

        {/* Soft drift accents */}
        <div
          aria-hidden
          className="animate-float-soft pointer-events-none absolute top-20 left-[6%] z-0 hidden size-72 rounded-full bg-[oklch(0.91_0.026_70/0.5)] blur-3xl lg:block"
        />
        <div
          aria-hidden
          className="animate-drift-alt pointer-events-none absolute right-[8%] bottom-[10%] z-0 hidden size-64 rounded-full bg-[oklch(0.92_0.024_75/0.5)] blur-3xl lg:block"
          style={{ animationDelay: "-3s" }}
        />

        <div className="relative z-10 flex w-full flex-col justify-center px-8 py-16 lg:w-1/2 lg:px-16 lg:py-20">
          {/* eyebrow group */}
          <div className="flex flex-col gap-3">
            <div className="inline-flex w-fit items-center gap-3">
              <span className="h-px w-10 bg-[oklch(0.6_0.062_60)]" />
              <span className="text-[11px] font-semibold tracking-[0.32em] text-[oklch(0.5_0.024_60)] uppercase">
                Spring · Summer 2026
              </span>
            </div>
            <p className="font-display text-[12px] font-semibold tracking-[0.42em] text-[oklch(0.34_0.03_55)] uppercase">
              ✦ Hôm nay bạn muốn mặc gì? ✦
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-2 lg:mt-6 lg:gap-3">
            <h1 className="font-display text-[40px] leading-[0.98] font-medium tracking-[-0.02em] text-[oklch(0.18_0.014_55)] uppercase lg:text-[68px]">
              Ngàn outfit
            </h1>
            <p className="font-display text-[40px] leading-[0.98] font-medium tracking-[-0.01em] text-[oklch(0.6_0.062_60)] italic lg:text-[68px]">
              mới luôn sẵn sàng
            </p>
            <p className="font-display text-[40px] leading-[0.98] font-medium tracking-[-0.02em] text-[oklch(0.18_0.014_55)] uppercase lg:text-[68px]">
              cho bạn.
            </p>
          </div>

          {/* <p className="mt-6 max-w-xl text-[15px] leading-[1.7] text-[oklch(0.4_0.024_55)] lg:mt-7">
            StyleLoop mang cả{" "}
            <span className="text-[oklch(0.34_0.03_55)] italic">
              “tủ đồ online”
            </span>{" "}
            đến tận nhà bạn — nơi bạn có thể thuê những thiết kế mới nhất, thử
            thoải mái mà không cần ra ngoài. Mặc đẹp mỗi ngày, đổi style liên
            tục, mà chi phí chỉ bằng một nửa so với thị trường.
          </p> */}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button className="ribbon-tan group/btn relative isolate h-auto w-full cursor-pointer overflow-hidden rounded-full px-6 py-3 text-[11px] font-semibold tracking-[0.22em] uppercase transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-14px_oklch(0.34_0.03_55/0.55)] active:translate-y-0 active:duration-100 lg:w-auto">
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

            <Button
              variant="outline"
              className="group/btn2 relative isolate h-auto w-full cursor-pointer overflow-hidden rounded-full border !border-[oklch(0.18_0.014_55)] bg-transparent px-6 py-3 text-[11px] font-semibold tracking-[0.22em] text-[oklch(0.18_0.014_55)] uppercase transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-16px_oklch(0.18_0.014_55/0.5)] active:translate-y-0 lg:w-auto"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 translate-y-full bg-[oklch(0.18_0.014_55)] transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover/btn2:translate-y-0"
              />
              <span className="relative flex items-center gap-3 transition-colors duration-500 group-hover/btn2:text-[oklch(0.97_0.012_78)]">
                Cho thuê đồ
                <Heart className="size-4 transition-all duration-500 ease-out group-hover/btn2:scale-110 group-hover/btn2:fill-[oklch(0.6_0.062_60)] group-hover/btn2:stroke-[oklch(0.6_0.062_60)]" />
              </span>
            </Button>
          </div>

          <div className="mt-10 grid w-full grid-cols-3 gap-0 divide-x divide-[oklch(0.86_0.018_70)] border-y border-[oklch(0.86_0.018_70)] py-5 lg:mt-12">
            <div className="px-6 text-center">
              <p className="font-display text-3xl font-medium tracking-tight text-[oklch(0.18_0.014_55)]">
                10k+
              </p>
              <p className="mt-1 text-center text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.5_0.024_60)] uppercase">
                Outfits
              </p>
            </div>
            <div className="px-6 text-center">
              <p className="font-display text-3xl font-medium tracking-tight text-[oklch(0.18_0.014_55)]">
                4.9★
              </p>
              <p className="mt-1 text-center text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.5_0.024_60)] uppercase">
                2,500 reviews
              </p>
            </div>
            <div className="px-6 text-center">
              <p className="font-display text-3xl font-medium tracking-tight text-[oklch(0.18_0.014_55)]">
                24h
              </p>
              <p className="mt-1 text-center text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.5_0.024_60)] uppercase">
                Toàn quốc
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT — editorial collage */}
        <div className="relative flex h-[560px] w-full items-center justify-center overflow-hidden p-8 lg:h-[740px] lg:w-1/2">
          <div
            aria-hidden
            className="animate-blob absolute top-10 right-10 size-96 bg-[oklch(0.86_0.034_70/0.6)] opacity-70 blur-2xl"
          />

          <div className="relative size-full max-w-xl">
            {/* Frame 1 */}
            <div className="rotated-card-1 absolute top-8 left-0 z-10 h-2/3 w-2/3 overflow-hidden rounded-sm bg-[oklch(0.99_0.008_78)] p-2.5 pb-10 shadow-[0_30px_60px_-30px_oklch(0.34_0.03_55/0.5)] ring-1 ring-[oklch(0.86_0.018_70)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Home-Img/image-1.png"
                alt="Vibrant yellow dress fashion"
                className="size-full object-cover grayscale-[0.05]"
              />
              <div className="absolute right-3 bottom-2 left-3 flex items-center justify-between">
                <span className="font-display text-[10px] tracking-[0.22em] text-[oklch(0.34_0.03_55)] uppercase">
                  Linn Midi
                </span>
                <span className="text-[10px] tracking-[0.22em] text-[oklch(0.6_0.062_60)] uppercase">
                  N°01
                </span>
              </div>
            </div>

            {/* Frame 2 */}
            <div className="rotated-card-2 absolute right-0 bottom-8 z-20 h-3/5 w-3/5 overflow-hidden rounded-sm bg-[oklch(0.99_0.008_78)] p-2.5 pb-10 shadow-[0_30px_60px_-30px_oklch(0.34_0.03_55/0.5)] ring-1 ring-[oklch(0.86_0.018_70)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Home-Img/image-2.png"
                alt="Editorial streetwear model"
                className="size-full object-cover grayscale-[0.05]"
              />
              <div className="absolute top-3 right-3 rounded-full bg-[oklch(0.18_0.014_55)] px-3 py-1 text-[10px] tracking-[0.22em] text-[oklch(0.97_0.012_78)] uppercase">
                3 ngày
              </div>
              <div className="absolute right-3 bottom-2 left-3 flex items-center justify-between">
                <span className="font-display text-[10px] tracking-[0.22em] text-[oklch(0.34_0.03_55)] uppercase">
                  Casual Blazer
                </span>
                <span className="text-[10px] tracking-[0.22em] text-[oklch(0.6_0.062_60)] uppercase">
                  N°02
                </span>
              </div>
            </div>

            {/* Frame 3 — center */}
            <div className="rotated-card-3 absolute top-1/2 left-1/2 z-30 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-sm bg-[oklch(0.99_0.008_78)] p-2.5 pb-10 shadow-[0_36px_70px_-30px_oklch(0.34_0.03_55/0.55)] ring-1 ring-[oklch(0.86_0.018_70)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Home-Img/image-3.png"
                alt="Minimalist clothing rack"
                className="size-full object-cover grayscale-[0.05]"
              />
              <div className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-[oklch(0.99_0.008_78)] shadow-md">
                <Heart className="size-4 fill-[oklch(0.6_0.062_60)] stroke-[oklch(0.6_0.062_60)]" />
              </div>
              <p className="absolute bottom-1 left-1/2 -translate-x-1/2 font-display text-[11px] tracking-[0.32em] text-[oklch(0.6_0.062_60)] uppercase">
                Style Soulmate
              </p>
            </div>

            {/* tiny decorations */}
            <Star
              className="animate-twinkle absolute top-6 right-12 size-6 fill-[oklch(0.78_0.04_70)] stroke-[oklch(0.6_0.062_60)]"
              style={{ animationDelay: "0.4s" }}
            />
            <Sparkles
              className="animate-float-soft absolute bottom-24 left-6 size-9 fill-[oklch(0.86_0.034_70)] stroke-[oklch(0.6_0.062_60)]"
              style={{ ["--spin" as string]: "-8deg" } as React.CSSProperties}
            />
          </div>
        </div>
      </section>

      {/* ─────────── ABOUT US — manifesto ─────────── */}
      <section className="relative overflow-hidden bg-[oklch(0.18_0.014_55)] text-[oklch(0.94_0.014_75)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_15%_30%,oklch(0.4_0.05_60/0.45),transparent_70%),radial-gradient(ellipse_55%_45%_at_85%_75%,oklch(0.6_0.062_60/0.25),transparent_72%)] opacity-40"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,oklch(0.6_0.062_60/0.6),transparent)]"
        />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-8 py-24 lg:grid-cols-[1fr_1.2fr] lg:gap-20 lg:px-12 lg:py-32">
          <div className="relative">
            <div className="relative overflow-hidden rounded-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Home-Img/image-10.jpg"
                alt="StyleLoop curated wardrobe"
                className="aspect-[4/5] w-full object-cover grayscale-[0.15]"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-[oklch(0.18_0.014_55/0.4)] via-transparent to-transparent"
              />
              <div className="absolute right-5 bottom-5 left-5 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.32em] text-[oklch(0.78_0.04_70)] uppercase">
                    Lookbook 26
                  </p>
                  <p className="mt-1 font-display text-xl tracking-tight text-[oklch(0.97_0.012_78)]">
                    The Editorial Curator
                  </p>
                </div>
                <span className="font-display text-[11px] tracking-[0.32em] text-[oklch(0.86_0.034_70)] uppercase">
                  N° 01 / 12
                </span>
              </div>
            </div>
            <span className="absolute -top-4 -left-4 hidden font-display text-[140px] leading-none font-medium text-[oklch(0.6_0.062_60/0.15)] italic lg:block">
              S
            </span>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[oklch(0.78_0.04_70)]" />
              <span className="text-[11px] font-semibold tracking-[0.32em] text-[oklch(0.78_0.04_70)] uppercase">
                ✦ About StyleLoop ✦
              </span>
            </div>

            <h2 className="font-display text-[34px] leading-[1.05] font-medium tracking-[-0.01em] text-[oklch(0.97_0.012_78)] lg:text-[52px]">
              Giải phóng tủ đồ,
              <br />
              <span className="text-[oklch(0.86_0.034_70)] italic">
                tự do phong cách
              </span>{" "}
              cùng StyleLoop.
            </h2>

            <p className="max-w-xl text-[15px] leading-[1.85] text-[oklch(0.82_0.018_70)]">
              Chúng tôi mang đến giải pháp thuê đồ thông minh — nơi mỗi món đồ
              là một lời mời gọi bạn thử nghiệm phong cách mới mỗi ngày, mà
              không ràng buộc bởi sở hữu. Nâng tầm diện mạo chỉ với một cú chạm.
            </p>

            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-3">
              {[
                {
                  kicker: "01",
                  title: "Thử tại nhà",
                  caption: "Không cần ra ngoài, không áp lực.",
                },
                {
                  kicker: "02",
                  title: "Chuẩn mẫu mã",
                  caption: "Bộ sưu tập được tuyển chọn kỹ lưỡng.",
                },
                {
                  kicker: "03",
                  title: "An tâm chất lượng",
                  caption: "Kiểm định, giặt là, đóng gói cẩn trọng.",
                },
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

            <div className="pt-4">
              <Button
                variant="outline"
                className="group/btn h-auto w-full rounded-full border border-[oklch(0.78_0.04_70)] bg-transparent px-7 py-3 text-[12px] font-semibold tracking-[0.22em] text-[oklch(0.97_0.012_78)] uppercase transition-all duration-300 hover:border-[oklch(0.6_0.062_60)] hover:bg-[oklch(0.6_0.062_60)] lg:w-auto"
              >
                <span className="flex items-center gap-3">
                  Tìm hiểu thêm
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── HOW IT WORKS ─────────── */}
      <section className="bg-cream-warm relative">
        <div
          aria-hidden
          className="bg-halftone-tan pointer-events-none absolute inset-x-0 top-10 mx-auto h-[420px] max-w-5xl opacity-30"
        />
        <div className="relative mx-auto max-w-7xl px-8 py-28">
          <div className="mb-20 flex flex-col items-center gap-5 text-center">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[oklch(0.6_0.062_60)]" />
              <span className="text-[11px] font-semibold tracking-[0.32em] text-[oklch(0.5_0.024_60)] uppercase">
                ✦ Quy trình ✦
              </span>
              <span className="h-px w-10 bg-[oklch(0.6_0.062_60)]" />
            </div>
            <h2 className="font-display text-4xl font-medium tracking-[-0.01em] text-[oklch(0.18_0.014_55)] lg:text-[52px]">
              Cách StyleLoop{" "}
              <span className="text-[oklch(0.78_0.04_70)] italic">
                hoạt động
              </span>
            </h2>
            <p className="max-w-md text-[14px] leading-relaxed text-[oklch(0.5_0.024_60)]">
              Trải nghiệm thời trang tuần hoàn chỉ trong vài bước đơn giản.
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-4">
            <div
              aria-hidden
              className="absolute top-12 right-[12%] left-[12%] hidden h-px bg-[radial-gradient(circle,oklch(0.78_0.04_70)_1px,transparent_1.5px)] [background-size:12px_2px] lg:block"
            />
            {STEPS.map((step) => (
              <StepCard key={step.index} {...step} />
            ))}
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
              <span>✦ New drops mỗi tuần</span>
              <span className="tracking-[0.08em] text-[oklch(0.6_0.062_60)] normal-case italic">
                The Editorial Curator
              </span>
              <span>✧ Thuê 1 ngày · sống xanh</span>
              <span className="tracking-[0.08em] text-[oklch(0.6_0.062_60)] normal-case italic">
                style on repeat
              </span>
              <span>✦ Không sở hữu · chỉ trải nghiệm</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────── CATEGORIES ─────────── */}
      <section className="relative overflow-hidden py-24">
        <div aria-hidden className="bg-cream-warm absolute inset-0" />
        <div
          aria-hidden
          className="animate-drift absolute -top-16 left-[12%] size-64 rounded-full bg-[oklch(0.91_0.026_70/0.4)] blur-3xl"
        />
        <div
          aria-hidden
          className="animate-drift-alt absolute right-[8%] -bottom-20 size-72 rounded-full bg-[oklch(0.92_0.024_75/0.4)] blur-3xl"
          style={{ animationDelay: "-4s" }}
        />
        <div className="relative mx-auto mb-12 flex max-w-7xl flex-col items-start justify-between gap-4 px-8 lg:flex-row lg:items-end lg:px-12">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold tracking-[0.32em] text-[oklch(0.5_0.024_60)] uppercase">
              ✦ Bộ sưu tập ✦
            </p>
            <h2 className="font-display text-4xl font-medium tracking-[-0.01em] text-[oklch(0.18_0.014_55)] lg:text-[52px]">
              Danh mục đang{" "}
              <span className="text-[oklch(0.6_0.062_60)] italic">
                được yêu thích
              </span>
            </h2>
          </div>
          <a
            href="#"
            className="group flex items-center gap-3 border-b border-[oklch(0.18_0.014_55)] pb-1 text-[12px] font-semibold tracking-[0.22em] text-[oklch(0.18_0.014_55)] uppercase transition-all hover:gap-4"
          >
            Xem tất cả
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
        <div className="relative no-scrollbar flex gap-6 overflow-x-auto px-8 pb-8 lg:px-12">
          {CATEGORIES.map((category) => (
            <CategoryCard key={category.name} {...category} />
          ))}
          <div className="flex h-72 w-[220px] flex-shrink-0 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-[oklch(0.6_0.062_60)] bg-[oklch(0.99_0.008_78)]/60 p-6 text-center backdrop-blur">
            <div className="flex size-12 items-center justify-center rounded-full bg-[oklch(0.18_0.014_55)] text-[oklch(0.97_0.012_78)]">
              <Sparkles className="size-5" />
            </div>
            <p className="font-display text-base font-medium text-[oklch(0.18_0.014_55)]">
              Gợi ý riêng cho bạn
            </p>
            <p className="text-[12px] leading-relaxed text-[oklch(0.5_0.024_60)]">
              Mở khóa đề xuất từ AI stylist của StyleLoop
            </p>
          </div>
        </div>
      </section>

      {/* ─────────── HOT PRODUCTS ─────────── */}
      <section className="relative mx-auto max-w-7xl px-8 py-28 lg:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute top-20 right-6 -z-10 size-72 rounded-full bg-[oklch(0.91_0.026_70/0.35)] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-20 left-10 -z-10 size-64 rounded-full bg-[oklch(0.92_0.024_75/0.4)] blur-3xl"
        />

        <div className="mb-14 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold tracking-[0.32em] text-[oklch(0.5_0.024_60)] uppercase">
              ✦ This week’s edit ✦
            </p>
            <h2 className="font-display text-4xl font-medium tracking-[-0.01em] text-[oklch(0.18_0.014_55)] lg:text-[58px]">
              Featured{" "}
              <span className="text-[oklch(0.6_0.062_60)] italic">Pieces</span>
            </h2>
          </div>
          {/* <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              aria-label="Trang trước"
              className="size-11 rounded-full border border-[oklch(0.34_0.03_55)] bg-transparent text-[oklch(0.34_0.03_55)] hover:border-[oklch(0.18_0.014_55)] hover:bg-[oklch(0.18_0.014_55)] hover:text-[oklch(0.97_0.012_78)]"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              size="icon"
              aria-label="Trang sau"
              className="ribbon-tan size-11 rounded-full"
            >
              <ChevronRight className="size-5" />
            </Button>
          </div> */}
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.title} {...product} />
          ))}
        </div>
      </section>

      {/* ─────────── WHY STYLELOOP ─────────── */}
      <section className="relative overflow-hidden py-28">
        <div aria-hidden className="bg-cream-soft absolute inset-0" />
        <div
          aria-hidden
          className="bg-halftone-tan pointer-events-none absolute inset-0 opacity-50"
        />

        <div className="relative mx-auto max-w-7xl px-8 lg:px-12">
          <div className="mb-16 space-y-4 text-center">
            <p className="text-[11px] font-semibold tracking-[0.32em] text-[oklch(0.5_0.024_60)] uppercase">
              ✦ Vì sao chọn chúng tôi ✦
            </p>
            <h2 className="font-display text-4xl font-medium tracking-[-0.01em] text-[oklch(0.18_0.014_55)] lg:text-[52px]">
              Ba lý do bạn sẽ{" "}
              <span className="text-[oklch(0.6_0.062_60)] italic">
                phải lòng
              </span>{" "}
              StyleLoop
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {[
              {
                icon: PiggyBank,
                title: "Tiết kiệm đến 80%",
                copy: "Thay vì bỏ cả triệu mua đồ chỉ mặc một lần, bạn có thể thuê với giá chỉ bằng 1/10 — tủ đồ xoay vòng mỗi tuần.",
                index: "01",
              },
              {
                icon: Leaf,
                title: "Thời trang bền vững",
                copy: "Kéo dài tuổi thọ cho trang phục, giảm rác thải thời trang. Mỗi lần thuê là một hành động yêu hành tinh.",
                index: "02",
              },
              {
                icon: ShieldCheck,
                title: "Cộng đồng đáng tin",
                copy: "Mọi giao dịch đều được bảo đảm. Chủ tủ và người thuê được xác minh, đánh giá công tâm và minh bạch.",
                index: "03",
              },
            ].map(({ icon: Icon, title, copy, index }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-md bg-[oklch(0.99_0.008_78)] p-8 ring-1 ring-[oklch(0.86_0.018_70)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_50px_-22px_oklch(0.34_0.03_55/0.4)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex size-14 items-center justify-center rounded-full bg-[oklch(0.18_0.014_55)] text-[oklch(0.97_0.012_78)]">
                    <Icon className="size-6" strokeWidth={1.4} />
                  </div>
                  <span className="font-display text-[40px] leading-none font-medium text-[oklch(0.86_0.034_70)] italic">
                    {index}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-medium tracking-tight text-[oklch(0.18_0.014_55)]">
                  {title}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-[oklch(0.5_0.024_60)]">
                  {copy}
                </p>
                <div
                  aria-hidden
                  className="mt-6 h-px bg-[linear-gradient(90deg,oklch(0.6_0.062_60),transparent)]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── TESTIMONIALS ─────────── */}
      <section className="relative mx-auto max-w-7xl px-8 py-28 lg:px-12">
        <div className="mb-16 flex flex-col items-center gap-4 text-center">
          <p className="text-[11px] font-semibold tracking-[0.32em] text-[oklch(0.5_0.024_60)] uppercase">
            ✦ Diary entries ✦
          </p>
          <h2 className="tracking-whith font-display text-4xl font-medium text-white lg:text-[52px]">
            Tiếng vang từ{" "}
            <span className="text-[oklch(0.6_0.062_60)] italic">Closet</span>
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center gap-12 lg:flex-row lg:items-start">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.author} {...t} />
          ))}
        </div>
      </section>

      {/* ─────────── CTA ─────────── */}
      <section className="mx-6 mb-24 lg:mx-10">
        <div className="relative overflow-hidden rounded-md bg-[oklch(0.18_0.014_55)] p-10 lg:p-16">
          <div
            aria-hidden
            className="bg-noise absolute inset-0 opacity-15 mix-blend-overlay"
          />
          <div
            aria-hidden
            className="absolute -top-20 -right-20 size-96 rounded-full bg-[oklch(0.6_0.062_60/0.25)] blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-20 -left-20 size-80 rounded-full bg-[oklch(0.4_0.05_60/0.2)] blur-3xl"
          />

          <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-10 bg-[oklch(0.78_0.04_70)]" />
                <span className="text-[11px] font-semibold tracking-[0.32em] text-[oklch(0.78_0.04_70)] uppercase">
                  ✦ Cho thuê · Kiếm thêm ✦
                </span>
              </div>
              <h2 className="mb-6 font-display text-4xl leading-[1.05] font-medium tracking-[-0.01em] text-[oklch(0.97_0.012_78)] lg:text-[58px]">
                Tủ đồ của bạn{" "}
                <span className="text-[oklch(0.86_0.034_70)] italic">
                  đang ngủ
                </span>
                ?
                <br />
                Đánh thức nó.
              </h2>
              <p className="mb-8 max-w-md text-[15px] leading-relaxed text-[oklch(0.82_0.018_70)]">
                Chia sẻ phong cách của bạn và nhận lại thu nhập đều đặn. Tham
                gia cộng đồng{" "}
                <b className="font-semibold text-[oklch(0.97_0.012_78)]">
                  5,000+ chủ tủ
                </b>{" "}
                ngay hôm nay.
              </p>
              <Button className="ribbon-tan h-auto rounded-full px-9 py-4 text-[12px] font-semibold tracking-[0.22em] uppercase">
                <span className="flex items-center gap-3">
                  Bắt đầu cho thuê
                  <Rocket className="size-4" />
                </span>
              </Button>
            </div>

            <div className="relative hidden h-80 lg:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={"/Home-Img/image-10.jpg"}
                alt="Colorful modern wardrobe"
                className="absolute inset-0 size-full rounded-sm object-cover grayscale-[0.15]"
              />
              <div className="absolute -top-3 -left-3 rounded-sm bg-[oklch(0.6_0.062_60)] px-4 py-2 font-display text-[13px] tracking-[0.22em] text-[oklch(0.97_0.012_78)] uppercase">
                2.4tr / tháng
              </div>
              <div className="absolute -right-3 bottom-8 rounded-sm bg-[oklch(0.99_0.008_78)] px-4 py-2 text-[11px] font-semibold tracking-[0.22em] text-[oklch(0.18_0.014_55)] uppercase">
                Avg earnings
              </div>
              <div className="absolute -bottom-4 left-8 flex items-center gap-2 rounded-full bg-[oklch(0.99_0.008_78)] px-4 py-2 text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.18_0.014_55)] uppercase shadow-md">
                <div className="flex -space-x-2">
                  <div className="size-5 rounded-full bg-[oklch(0.78_0.04_70)] ring-2 ring-[oklch(0.99_0.008_78)]" />
                  <div className="size-5 rounded-full bg-[oklch(0.86_0.034_70)] ring-2 ring-[oklch(0.99_0.008_78)]" />
                  <div className="size-5 rounded-full bg-[oklch(0.6_0.062_60)] ring-2 ring-[oklch(0.99_0.008_78)]" />
                </div>
                5,000+ chủ tủ
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
