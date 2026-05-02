"use client"

import { useState, useMemo } from "react"
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from "date-fns"
import { vi } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  selected?: Date
  onSelect?: (date: Date) => void
  disabled?: (date: Date) => boolean
  defaultMonth?: Date
}

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

export function RentalCalendar({ selected, onSelect, disabled, defaultMonth }: Props) {
  const [month, setMonth] = useState<Date>(defaultMonth ?? selected ?? new Date())

  const cells = useMemo(() => {
    const from = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
    const to = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
    return eachDayOfInterval({ start: from, end: to })
  }, [month])

  return (
    <div className="w-[300px] select-none p-4">
      {/* ── Month nav ── */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth((m) => subMonths(m, 1))}
          className="flex size-8 cursor-pointer items-center justify-center rounded-sm text-[oklch(0.38_0.028_58)] transition-colors hover:bg-[oklch(0.91_0.022_75)]"
          aria-label="Tháng trước"
        >
          <ChevronLeft className="size-4" strokeWidth={1.5} />
        </button>

        <span className="font-display text-[15px] font-semibold capitalize text-[oklch(0.18_0.014_55)]">
          {format(month, "MMMM yyyy", { locale: vi })}
        </span>

        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="flex size-8 cursor-pointer items-center justify-center rounded-sm text-[oklch(0.38_0.028_58)] transition-colors hover:bg-[oklch(0.91_0.022_75)]"
          aria-label="Tháng sau"
        >
          <ChevronRight className="size-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* ── Weekday headers ── */}
      <div className="mb-1 grid grid-cols-7">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-[oklch(0.55_0.03_58)]"
          >
            {d}
          </div>
        ))}
      </div>

      {/* ── Day grid ── */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day) => {
          const inMonth = isSameMonth(day, month)
          const isSelected = selected ? isSameDay(day, selected) : false
          const isDisabled = !inMonth || (disabled ? disabled(day) : false)
          const todayDay = isToday(day)

          let cellClass =
            "relative flex h-9 w-full items-center justify-center rounded-sm text-[13px] font-medium transition-all duration-150 "

          if (!inMonth) {
            cellClass += "cursor-default text-[oklch(0.78_0.022_68)] opacity-0"
          } else if (isDisabled) {
            cellClass +=
              "cursor-not-allowed text-[oklch(0.72_0.022_65)] line-through opacity-40"
          } else if (isSelected) {
            cellClass +=
              "cursor-pointer bg-[oklch(0.6_0.062_60)] font-semibold text-[oklch(0.985_0.008_80)] shadow-[0_4px_12px_-4px_oklch(0.4_0.05_58/0.5)]"
          } else if (todayDay) {
            cellClass +=
              "cursor-pointer bg-[oklch(0.86_0.034_70)] font-semibold text-[oklch(0.18_0.014_55)] ring-1 ring-[oklch(0.6_0.062_60)/0.5]"
          } else {
            cellClass +=
              "cursor-pointer text-[oklch(0.22_0.02_55)] hover:bg-[oklch(0.91_0.022_75)]"
          }

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && onSelect?.(day)}
              aria-label={format(day, "dd/MM/yyyy")}
              aria-pressed={isSelected}
              className={cellClass}
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}
