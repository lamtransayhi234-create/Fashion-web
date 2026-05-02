"use client"

import { useState, useRef, useCallback } from "react"
import { ZoomIn } from "lucide-react"

export function ProductImageZoom({ src, alt }: { src: string; alt: string }) {
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState("50% 50%")
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current!.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin(`${x.toFixed(2)}% ${y.toFixed(2)}%`)
  }, [])

  return (
    <div className="relative">
      {/* Decorative corner frames */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-3 -left-3 z-10 h-12 w-12 border-t border-l border-[oklch(0.6_0.062_60)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-3 -right-3 z-10 h-12 w-12 border-b border-r border-[oklch(0.6_0.062_60)]"
      />

      {/* Image container */}
      <div
        ref={containerRef}
        className="group relative overflow-hidden rounded-md bg-[oklch(0.94_0.014_75)] ring-1 ring-[oklch(0.88_0.018_70)] shadow-[0_24px_60px_-20px_oklch(0.34_0.03_55/0.3)]"
        style={{ aspectRatio: "3/4", cursor: zoomed ? "zoom-out" : "zoom-in" }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => {
          setZoomed(false)
          setOrigin("50% 50%")
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="h-full w-full select-none object-cover grayscale-[0.06]"
          style={{
            transform: zoomed ? "scale(2.4)" : "scale(1)",
            transformOrigin: origin,
            transition: "transform 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            willChange: "transform",
          }}
        />

        {/* Grain overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]"
        />

        {/* Zoom hint — fades out when zoomed */}
        <div
          className={`pointer-events-none absolute bottom-5 right-5 z-10 flex items-center gap-2 rounded-sm bg-[oklch(0.99_0.008_78)]/90 px-3 py-2 text-[10px] font-semibold tracking-[0.18em] uppercase text-[oklch(0.34_0.03_55)] backdrop-blur-md transition-opacity duration-300 ${zoomed ? "opacity-0" : "opacity-100"}`}
        >
          <ZoomIn className="size-3.5 text-[oklch(0.6_0.062_60)]" strokeWidth={1.6} />
          Di chuột để phóng to
        </div>

        {/* Vignette at edges */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,oklch(0.18_0.014_55/0.12)_100%)]"
        />
      </div>
    </div>
  )
}
