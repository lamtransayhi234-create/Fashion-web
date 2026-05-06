"use client"

import { useEffect, useState } from "react"
import { ChevronUp } from "lucide-react"

const ITEMS = [
  { id: "bai-01", n: "01", short: "Cami satin" },
  { id: "bai-02", n: "02", short: "Voan hoa" },
  { id: "bai-03", n: "03", short: "Lụa trễ vai" },
  { id: "bai-04", n: "04", short: "Sequin" },
  { id: "bai-05", n: "05", short: "Wrap midi" },
  { id: "bai-06", n: "06", short: "Babydoll" },
]

export function ArticleNav() {
  const [active, setActive] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    // Smooth-scroll only on the news page (anchor jumps between articles).
    const html = document.documentElement
    html.classList.add("scroll-smooth")

    // Track which article ids are currently intersecting; nav stays visible
    // only while at least one article is on screen.
    const ratios = new Map<string, number>()

    const pickActive = () => {
      let bestId: string | null = null
      let bestRatio = 0
      ratios.forEach((r, id) => {
        if (r > bestRatio) {
          bestRatio = r
          bestId = id
        }
      })
      setActive(bestRatio > 0 ? bestId : null)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0)
        })
        pickActive()
      },
      { rootMargin: "-30% 0px -45% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    )

    ITEMS.forEach((it) => {
      const el = document.getElementById(it.id)
      if (el) observer.observe(el)
    })

    const onScroll = () => {
      const total =
        document.documentElement.scrollHeight - window.innerHeight
      const current = window.scrollY
      setProgress(total > 0 ? Math.min(100, (current / total) * 100) : 0)
      setShowTop(current > window.innerHeight * 0.6)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", onScroll)
      html.classList.remove("scroll-smooth")
    }
  }, [])

  const navVisible = active !== null

  return (
    <>
      {/* Reading progress bar (under sticky site header) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-[100px] z-40 h-[2px] bg-transparent"
      >
        <div
          className="h-full bg-[oklch(0.6_0.062_60)] transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating side nav (desktop only) — only visible while reading articles */}
      <nav
        aria-label="Bài viết trong số này"
        aria-hidden={!navVisible}
        className={`fixed top-1/2 left-6 z-30 hidden -translate-y-1/2 transition-opacity duration-500 ease-out lg:block xl:left-10 ${
          navVisible
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <p className="mb-4 font-display text-[10px] tracking-[0.32em] text-[oklch(0.5_0.024_60)] uppercase">
          ✦ Số tuần này
        </p>
        <ul className="space-y-3">
          {ITEMS.map((it) => {
            const isActive = active === it.id
            return (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  className="group flex items-center gap-3"
                  aria-current={isActive ? "true" : undefined}
                >
                  <span
                    aria-hidden
                    className={`flex h-px items-center transition-all duration-500 ${
                      isActive ? "w-8" : "w-4 group-hover:w-7"
                    }`}
                  >
                    <span
                      className={`block h-px w-full transition-colors duration-500 ${
                        isActive
                          ? "bg-[oklch(0.6_0.062_60)]"
                          : "bg-[oklch(0.78_0.04_70/0.7)] group-hover:bg-[oklch(0.6_0.062_60)]"
                      }`}
                    />
                  </span>
                  <span
                    className={`font-display text-[11px] tracking-[0.32em] uppercase transition-colors duration-500 ${
                      isActive
                        ? "text-[oklch(0.18_0.014_55)]"
                        : "text-[oklch(0.5_0.024_60)] group-hover:text-[oklch(0.18_0.014_55)]"
                    }`}
                  >
                    N°{it.n}
                  </span>
                  <span
                    className={`font-display text-[12px] tracking-tight italic transition-all duration-500 ${
                      isActive
                        ? "translate-x-0 text-[oklch(0.6_0.062_60)] opacity-100"
                        : "-translate-x-1 text-[oklch(0.5_0.024_60)] opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    }`}
                  >
                    {it.short}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Back to top */}
      <a
        href="#top"
        aria-label="Lên đầu trang"
        className={`group fixed right-6 bottom-6 z-30 flex size-12 items-center justify-center rounded-full bg-[oklch(0.18_0.014_55)] text-[oklch(0.97_0.012_78)] shadow-[0_18px_40px_-14px_oklch(0.18_0.014_55/0.55)] transition-all duration-500 ease-out hover:scale-110 hover:bg-[oklch(0.6_0.062_60)] lg:right-10 lg:bottom-10 ${
          showTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <ChevronUp className="size-5" strokeWidth={1.6} />
      </a>
    </>
  )
}
