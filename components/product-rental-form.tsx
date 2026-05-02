"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { addDays, differenceInCalendarDays, format, isBefore } from "date-fns"
import { vi } from "date-fns/locale"
import {
  ArrowUpRight,
  CalendarDays,
  Heart,
  LogIn,
  Ruler,
  ShieldAlert,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAuthStore } from "@/lib/store/auth-store"
import { useOrderStore } from "@/lib/store/order-store"
import type { ProductSize } from "@/lib/data/products"

const MIN_RENTAL_DAYS = 3
const MAX_RENTAL_DAYS = 21

// Force light-mode palette for the calendar popover regardless of system theme
const calendarVars = {
  "--background": "oklch(0.99 0.008 78)",
  "--foreground": "oklch(0.18 0.014 55)",
  "--popover": "oklch(0.99 0.008 78)",
  "--popover-foreground": "oklch(0.18 0.014 55)",
  "--primary": "oklch(0.6 0.062 60)",
  "--primary-foreground": "oklch(0.985 0.008 80)",
  "--muted": "oklch(0.91 0.022 75)",
  "--muted-foreground": "oklch(0.38 0.028 58)",
  "--accent": "oklch(0.86 0.034 70)",
  "--accent-foreground": "oklch(0.18 0.014 55)",
  "--border": "oklch(0.88 0.018 70)",
  "--ring": "oklch(0.6 0.062 60)",
} as React.CSSProperties

type Props = {
  sizes: ProductSize[]
  isAvailable: boolean
  rentalPrice: number
  // needed for order store
  productId: string
  productName: string
  productSrc: string
  productType: string
  color: string
  brandPrice: number
}

export function ProductRentalForm({
  sizes,
  isAvailable,
  rentalPrice,
  productId,
  productName,
  productSrc,
  productType,
  color,
  brandPrice,
}: Props) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const setPending = useOrderStore((s) => s.setPending)

  // Avoid SSR/client hydration mismatch with localStorage-persisted store
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null)
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()
  const [fromOpen, setFromOpen] = useState(false)
  const [toOpen, setToOpen] = useState(false)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Auth-derived states (only evaluated after client hydration)
  const authed = mounted && isAuthenticated
  const isUser = authed && user?.role === "user"
  const isOtherRole = authed && user?.role !== "user"

  const maxToDate = fromDate ? addDays(fromDate, MAX_RENTAL_DAYS) : undefined

  const nights =
    fromDate && toDate
      ? Math.max(0, differenceInCalendarDays(toDate, fromDate))
      : 0
  const total = nights * rentalPrice
  const tooFewDays = nights > 0 && nights < MIN_RENTAL_DAYS
  const canRent = isUser && isAvailable && selectedSize && nights >= MIN_RENTAL_DAYS

  function handleFromSelect(date: Date | undefined) {
    setFromDate(date)
    if (date && toDate) {
      if (
        isBefore(toDate, date) ||
        differenceInCalendarDays(toDate, date) > MAX_RENTAL_DAYS
      ) {
        setToDate(undefined)
      }
    }
    setFromOpen(false)
    if (date) setTimeout(() => setToOpen(true), 120)
  }

  return (
    <div className="space-y-7">
      {/* ── Size ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <Ruler
            className="size-3.5 text-[oklch(0.6_0.062_60)]"
            strokeWidth={1.4}
          />
          <span className="text-[11px] font-semibold tracking-[0.24em] text-[oklch(0.28_0.022_55)] uppercase">
            Chọn size
          </span>
          {selectedSize && (
            <span className="ml-auto rounded-sm bg-[oklch(0.91_0.022_75)] px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-[oklch(0.28_0.022_55)] uppercase">
              {selectedSize}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={`min-w-[48px] rounded-sm px-4 py-2.5 text-[12px] font-semibold tracking-[0.1em] uppercase ring-1 transition-all duration-200 ${
                selectedSize === size
                  ? "ribbon-tan ring-transparent"
                  : "bg-[oklch(0.94_0.014_75)] text-[oklch(0.22_0.02_55)] ring-[oklch(0.88_0.018_70)] hover:bg-[oklch(0.91_0.022_75)] hover:ring-[oklch(0.6_0.062_60)]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* ── Dates ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <CalendarDays
            className="size-3.5 text-[oklch(0.6_0.062_60)]"
            strokeWidth={1.4}
          />
          <span className="text-[11px] font-semibold tracking-[0.24em] text-[oklch(0.28_0.022_55)] uppercase">
            Lịch thuê
          </span>
          <span className="ml-auto text-[10px] text-[oklch(0.52_0.03_58)] italic">
            Tối thiểu {MIN_RENTAL_DAYS} · Tối đa {MAX_RENTAL_DAYS} ngày
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Từ ngày */}
          <Popover open={fromOpen} onOpenChange={setFromOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex w-full flex-col items-start gap-1 rounded-sm bg-[oklch(0.94_0.014_75)] px-4 py-3 text-left ring-1 ring-[oklch(0.88_0.018_70)] transition-all hover:ring-[oklch(0.6_0.062_60)] focus:ring-[oklch(0.6_0.062_60)] focus:outline-none"
              >
                <span className="text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.52_0.03_58)] uppercase">
                  Từ ngày
                </span>
                <span
                  className={`text-[14px] font-semibold ${fromDate ? "text-[oklch(0.18_0.014_55)]" : "text-[oklch(0.65_0.035_60)]"}`}
                >
                  {fromDate ? format(fromDate, "dd/MM/yyyy") : "––/––/––––"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              style={calendarVars}
              className="w-auto p-0 shadow-[0_20px_60px_-18px_oklch(0.34_0.03_55/0.35)]"
            >
              <div className="border-b px-4 py-2.5">
                <p className="text-[10px] font-semibold tracking-[0.28em] text-muted-foreground uppercase">
                  ✦ Ngày bắt đầu thuê
                </p>
              </div>
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={handleFromSelect}
                disabled={{ before: today }}
                locale={vi}
                className="p-3"
                classNames={{ weekdays: "hidden" }}
              />
            </PopoverContent>
          </Popover>

          {/* Đến ngày */}
          <Popover open={toOpen} onOpenChange={setToOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={!fromDate}
                className="flex w-full flex-col items-start gap-1 rounded-sm bg-[oklch(0.94_0.014_75)] px-4 py-3 text-left ring-1 ring-[oklch(0.88_0.018_70)] transition-all hover:ring-[oklch(0.6_0.062_60)] focus:ring-[oklch(0.6_0.062_60)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.52_0.03_58)] uppercase">
                  Đến ngày
                </span>
                <span
                  className={`text-[14px] font-semibold ${toDate ? "text-[oklch(0.18_0.014_55)]" : "text-[oklch(0.65_0.035_60)]"}`}
                >
                  {toDate ? format(toDate, "dd/MM/yyyy") : "––/––/––––"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              style={calendarVars}
              className="w-auto p-0 shadow-[0_20px_60px_-18px_oklch(0.34_0.03_55/0.35)]"
            >
              <div className="border-b px-4 py-2.5">
                <div className="flex items-center justify-between gap-6">
                  <p className="text-[10px] font-semibold tracking-[0.28em] text-muted-foreground uppercase">
                    ✦ Ngày kết thúc
                  </p>
                  {maxToDate && (
                    <p className="text-[10px] text-muted-foreground">
                      Tối đa:{" "}
                      <span className="font-semibold text-foreground">
                        {format(maxToDate, "dd/MM/yyyy")}
                      </span>
                    </p>
                  )}
                </div>
              </div>
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={(d) => {
                  setToDate(d)
                  setToOpen(false)
                }}
                disabled={(date) =>
                  isBefore(date, today) ||
                  (!!fromDate && isBefore(date, fromDate)) ||
                  (!!maxToDate && date > maxToDate)
                }
                defaultMonth={fromDate}
                locale={vi}
                className="p-3"
                classNames={{ weekdays: "hidden" }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Summary row */}
        {fromDate && toDate && nights > 0 && (
          <div className="flex items-center justify-between text-[12px] text-[oklch(0.52_0.03_58)]">
            <span>
              {format(fromDate, "dd/MM")} → {format(toDate, "dd/MM/yyyy")} ·{" "}
              <span className="font-semibold text-[oklch(0.28_0.022_55)]">
                {nights} ngày
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                setFromDate(undefined)
                setToDate(undefined)
              }}
              className="font-semibold tracking-wider text-[oklch(0.6_0.062_60)] uppercase transition-colors hover:text-[oklch(0.48_0.022_60)]"
            >
              Xoá
            </button>
          </div>
        )}

        {/* Warning: too few days */}
        {tooFewDays && (
          <div className="flex items-center gap-2.5 rounded-sm bg-[oklch(0.91_0.022_75)] px-4 py-3 ring-1 ring-[oklch(0.78_0.04_70)]">
            <span className="text-[13px]">⚠</span>
            <p className="text-[12px] text-[oklch(0.28_0.022_55)]">
              Cần thuê tối thiểu{" "}
              <span className="font-semibold">{MIN_RENTAL_DAYS} ngày</span>.
              Hiện đang chọn{" "}
              <span className="font-semibold">{nights} ngày</span> — vui lòng chọn lại ngày kết thúc.
            </p>
          </div>
        )}

        {/* Total */}
        {nights >= MIN_RENTAL_DAYS && (
          <div className="flex items-center justify-between rounded-sm bg-[oklch(0.91_0.022_75)] px-4 py-3">
            <span className="text-[11px] font-semibold tracking-[0.18em] text-[oklch(0.52_0.03_58)] uppercase">
              Tổng tiền · {nights} ngày
            </span>
            <span className="font-display text-[22px] font-semibold text-[oklch(0.18_0.014_55)]">
              {total.toLocaleString("vi-VN")}
              <span className="ml-1 text-[15px] font-normal text-[oklch(0.52_0.03_58)]">
                đ
              </span>
            </span>
          </div>
        )}
      </div>

      {/* ── CTAs ── */}
      <div className="space-y-3">
        <div className="flex items-stretch gap-3">
          {/* Chưa đăng nhập */}
          {!authed && (
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="ribbon-tan flex h-auto flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-full px-8 py-4 text-[12px] font-semibold tracking-[0.22em] uppercase transition-opacity hover:opacity-90"
            >
              <LogIn className="size-4" strokeWidth={1.8} />
              <span>Đăng nhập để thuê</span>
            </button>
          )}

          {/* Role admin / supplier — disable */}
          {isOtherRole && (
            <Button
              disabled
              className="ribbon-tan flex h-auto flex-1 cursor-not-allowed items-center justify-center gap-3 rounded-full px-8 py-4 text-[12px] font-semibold tracking-[0.22em] uppercase opacity-40"
            >
              <span>{isAvailable ? "Thuê ngay" : "Hết hàng"}</span>
            </Button>
          )}

          {/* Người dùng thường */}
          {isUser && (
            <Button
              className="ribbon-tan flex h-auto flex-1 items-center justify-center gap-3 rounded-full px-8 py-4 text-[12px] font-semibold tracking-[0.22em] uppercase disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canRent}
              onClick={() => {
                if (!canRent || !selectedSize || !fromDate || !toDate) return
                setPending({
                  productId,
                  productName,
                  productSrc,
                  productType,
                  size: selectedSize,
                  color,
                  fromDate: format(fromDate, "yyyy-MM-dd"),
                  toDate: format(toDate, "yyyy-MM-dd"),
                  nights,
                  rentalPricePerDay: rentalPrice,
                  total,
                  brandPrice,
                })
                router.push("/payment")
              }}
            >
              <span>{isAvailable ? "Thuê ngay" : "Hết hàng"}</span>
              {isAvailable && (
                <span className="flex size-6 items-center justify-center rounded-full bg-white/20">
                  <ArrowUpRight className="size-3.5" strokeWidth={1.8} />
                </span>
              )}
            </Button>
          )}
        </div>

        {/* Thông báo role không được phép */}
        {isOtherRole && (
          <div className="flex items-start gap-2.5 rounded-sm bg-[oklch(0.91_0.022_75)] px-4 py-3">
            <ShieldAlert
              className="mt-px size-4 shrink-0 text-[oklch(0.45_0.055_50)]"
              strokeWidth={1.5}
            />
            <p className="text-[12px] leading-relaxed text-[oklch(0.28_0.022_55)]">
              Chức năng thuê đồ chỉ dành cho{" "}
              <span className="font-semibold">tài khoản khách hàng</span>. Tài
              khoản{" "}
              <span className="font-semibold">
                {user?.role === "admin" ? "quản trị viên" : "nhà cung cấp"}
              </span>{" "}
              không thể đặt thuê.
            </p>
          </div>
        )}

        {/* Gợi ý đăng ký nếu chưa có tài khoản */}
        {!authed && (
          <p className="text-center text-[11px] text-[oklch(0.52_0.03_58)]">
            Chưa có tài khoản?{" "}
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="font-semibold text-[oklch(0.6_0.062_60)] underline-offset-2 hover:underline"
            >
              Đăng ký miễn phí
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
