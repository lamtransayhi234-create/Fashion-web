import Link from "next/link"
import { Camera, Globe, Heart, Mail, Sparkles, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type FooterColumn = {
  title: string
  links: { label: string; href: string }[]
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Về StyleLoop",
    links: [
      { label: "Giới thiệu", href: "#" },
      { label: "Blog thời trang", href: "#" },
      { label: "Tuyển dụng", href: "#" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Trung tâm trợ giúp", href: "#" },
      { label: "Quy trình thuê đồ", href: "#" },
      { label: "Bảo hiểm trang phục", href: "#" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="relative mt-20 w-full overflow-hidden bg-[oklch(0.16_0.012_55)] text-[oklch(0.86_0.014_75)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,oklch(0.6_0.062_60/0.6),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-[20%] size-96 rounded-full bg-[oklch(0.4_0.05_60/0.18)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[10%] -bottom-24 size-80 rounded-full bg-[oklch(0.6_0.062_60/0.12)] blur-3xl"
      />

      {/* Newsletter ribbon */}
      <div className="relative mx-auto max-w-7xl px-8 pt-14 pb-10 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_auto] lg:gap-10">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold tracking-[0.32em] text-[oklch(0.78_0.04_70)] uppercase">
              ✦ Newsletter ✦
            </p>
            <h3 className="font-display text-2xl font-medium tracking-tight text-[oklch(0.97_0.012_78)] lg:text-[28px]">
              Đăng ký nhận{" "}
              <span className="text-[oklch(0.86_0.034_70)] italic">
                ưu đãi sớm nhất
              </span>{" "}
              từ StyleLoop.
            </h3>
          </div>
          <form className="flex w-full max-w-md items-center gap-0 overflow-hidden rounded-full bg-[oklch(0.99_0.008_78)] p-1 shadow-[0_18px_40px_-20px_oklch(0_0_0/0.5)] lg:w-[440px]">
            <div className="flex flex-1 items-center gap-2 px-5">
              <Mail className="size-4 text-[oklch(0.5_0.024_60)]" />
              <Input
                type="email"
                placeholder="Email của bạn..."
                className="border-0 bg-transparent p-0 text-[13px] text-[oklch(0.18_0.014_55)] shadow-none placeholder:text-[oklch(0.55_0.024_60)] focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Button
              type="submit"
              className="ribbon-tan rounded-full px-7 py-3 text-[12px] font-semibold tracking-[0.18em] uppercase"
            >
              Đăng ký
            </Button>
          </form>
        </div>
      </div>

      {/* Hairline */}
      <div className="relative mx-auto max-w-7xl px-8 lg:px-12">
        <div className="editorial-rule h-px w-full opacity-30" />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-8 py-14 font-display text-sm md:grid-cols-4 lg:px-12">
        <div className="space-y-6">
          <Link href="#" className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-black tracking-[0.05em] text-[oklch(0.97_0.012_78)] uppercase">
              Style
            </span>
            <span className="font-display text-2xl font-medium tracking-tight text-[oklch(0.78_0.04_70)] italic">
              Loop
            </span>
          </Link>
          <p className="max-w-xs leading-relaxed text-[oklch(0.78_0.018_70)]">
            Editorial wardrobe rental — nơi bạn thuê những thiết kế đáng nhớ cho
            mọi khoảnh khắc, không cần sở hữu. Chuẩn mẫu mã. An tâm chất lượng.
          </p>
          <div className="flex gap-3">
            {[Globe, Users, Camera].map((Icon, i) => (
              <Link
                key={i}
                href="#"
                aria-label="Social"
                className="flex size-10 items-center justify-center rounded-full border border-[oklch(0.4_0.024_55)] text-[oklch(0.86_0.014_75)] transition-all hover:border-[oklch(0.78_0.04_70)] hover:bg-[oklch(0.6_0.062_60)] hover:text-white"
              >
                <Icon className="size-4" />
              </Link>
            ))}
          </div>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title} className="flex flex-col gap-4">
            <h4 className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.32em] text-[oklch(0.78_0.04_70)] uppercase">
              <Sparkles className="size-3 fill-[oklch(0.78_0.04_70)] stroke-[oklch(0.78_0.04_70)]" />
              {column.title}
            </h4>
            {column.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="w-fit text-[13px] text-[oklch(0.78_0.018_70)] transition-all hover:translate-x-1 hover:text-[oklch(0.97_0.012_78)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}

        <div className="flex flex-col gap-4">
          <h4 className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.32em] text-[oklch(0.78_0.04_70)] uppercase">
            <Heart className="size-3 fill-[oklch(0.78_0.04_70)] stroke-[oklch(0.78_0.04_70)]" />
            Liên hệ
          </h4>
          <p className="text-[13px] leading-relaxed text-[oklch(0.78_0.018_70)]">
            hello@styleloop.vn
            <br />
            Cầu Giấy, Hà Nội
            <br />
            Mở cửa: 9:00 — 21:00
          </p>
          <p className="mt-2 text-[11px] tracking-wide text-[oklch(0.7_0.024_60)] italic">
            “Mặc đẹp mỗi ngày, đổi style liên tục.”
          </p>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-8 lg:px-12">
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[oklch(0.3_0.024_55)] py-6 text-[11px] tracking-[0.18em] text-[oklch(0.62_0.018_60)] uppercase md:flex-row">
          <p>© 2026 StyleLoop Vietnam — The Editorial Curator</p>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-[oklch(0.92_0.014_75)]">
              Điều khoản
            </Link>
            <Link href="#" className="hover:text-[oklch(0.92_0.014_75)]">
              Bảo mật
            </Link>
            <Link href="#" className="hover:text-[oklch(0.92_0.014_75)]">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
