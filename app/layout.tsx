import type { Metadata } from "next"
import { Playfair_Display } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const fontDisplay = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
})

export const metadata: Metadata = {
  title: "StyleLoop | Tủ đồ xoay vòng — Editorial Fashion Rental",
  description:
    "Thuê đồ đẹp từ cộng đồng — mặc chất, tiết kiệm, bền vững. Không sở hữu, chỉ trải nghiệm.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontDisplay.variable,
        "font-sans"
      )}
    >
      <body className="relative min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(60%_45%_at_12%_8%,oklch(0.93_0.024_70/0.5),transparent_62%),radial-gradient(55%_40%_at_88%_90%,oklch(0.92_0.024_75/0.45),transparent_65%)]"
        />
        <div
          aria-hidden
          className="bg-noise pointer-events-none fixed inset-0 -z-10 opacity-[0.025] mix-blend-multiply"
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
