"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"

export interface DateRange {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  className?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

export function DateRangePicker({ value = {}, onChange, placeholder = "Pick a date range", className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [hoverDate, setHoverDate] = useState<Date | null>(null)

  // Parse current selected dates
  const fromDate = useMemo(() => {
    if (!value?.from) return null
    const parts = value.from.split("-")
    if (parts.length !== 3) return null
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
  }, [value?.from])

  const toDate = useMemo(() => {
    if (!value?.to) return null
    const parts = value.to.split("-")
    if (parts.length !== 3) return null
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
  }, [value?.to])

  // Track the month and year currently displayed in the calendar
  const [viewDate, setViewDate] = useState(() => fromDate || new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month])
  const firstDayIndex = useMemo(() => new Date(year, month, 1).getDay(), [year, month])

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setViewDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setViewDate(new Date(year, month + 1, 1))
  }

  const formatDateString = (date: Date) => {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, "0")
    const dd = String(date.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }

  const handleDaySelect = (day: number) => {
    const newDate = new Date(year, month, day)
    
    if (!fromDate) {
      onChange({ from: formatDateString(newDate) })
    } else if (fromDate && !toDate) {
      if (newDate < fromDate) {
        onChange({ from: formatDateString(newDate), to: formatDateString(fromDate) })
      } else {
        onChange({ from: formatDateString(fromDate), to: formatDateString(newDate) })
      }
      setOpen(false) // Close when range is complete
    } else if (fromDate && toDate) {
      // Reset range
      onChange({ from: formatDateString(newDate) })
    }
  }

  // Display value formatting
  const displayLabel = useMemo(() => {
    if (!fromDate) return placeholder
    
    const formatLabel = (date: Date) => {
      const day = String(date.getDate()).padStart(2, "0")
      const monthName = MONTH_NAMES[date.getMonth()].slice(0, 3)
      const yyyy = date.getFullYear()
      return `${monthName} ${day}, ${yyyy}`
    }

    if (fromDate && !toDate) {
      return `${formatLabel(fromDate)} - ...`
    }

    if (fromDate && toDate) {
      return `${formatLabel(fromDate)} - ${formatLabel(toDate)}`
    }

    return placeholder
  }, [fromDate, toDate, placeholder])

  const days = useMemo(() => {
    const list = []
    // Empty padding slots for days of prev month
    for (let i = 0; i < firstDayIndex; i++) {
      list.push(null)
    }
    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      list.push(d)
    }
    return list
  }, [firstDayIndex, daysInMonth])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className={cn(
            "w-full justify-between text-left font-normal select-none shadow-xs border border-input rounded-md bg-background hover:bg-accent/40 text-foreground transition-all duration-200",
            (!value?.from && !value?.to) && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{displayLabel}</span>
          <CalendarIcon className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 bg-popover border border-border rounded-lg shadow-lg select-none" align="start">
        {/* Header navigation */}
        <div className="flex items-center justify-between gap-1 pb-3 mb-2 border-b border-border/60">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            type="button"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-foreground">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            type="button"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 text-center" onMouseLeave={() => setHoverDate(null)}>
          {WEEKDAYS.map((day) => (
            <span key={day} className="text-xs font-semibold text-muted-foreground/80 py-1">
              {day}
            </span>
          ))}

          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="w-8 h-8" />
            }

            const currentDayDate = new Date(year, month, day)

            const isFrom = fromDate && currentDayDate.getTime() === fromDate.getTime()
            const isTo = toDate && currentDayDate.getTime() === toDate.getTime()
            const isSelected = isFrom || isTo

            let isInRange = false
            if (fromDate && toDate) {
              isInRange = currentDayDate > fromDate && currentDayDate < toDate
            } else if (fromDate && !toDate && hoverDate) {
              if (hoverDate > fromDate) {
                isInRange = currentDayDate > fromDate && currentDayDate <= hoverDate
              } else {
                isInRange = currentDayDate >= hoverDate && currentDayDate < fromDate
              }
            }

            const isToday = (() => {
              const today = new Date()
              return today.getDate() === day &&
                today.getMonth() === month &&
                today.getFullYear() === year
            })()

            return (
              <button
                key={`day-${day}`}
                type="button"
                onClick={() => handleDaySelect(day)}
                onMouseEnter={() => setHoverDate(currentDayDate)}
                className={cn(
                  "w-8 h-8 text-xs font-medium rounded-md flex items-center justify-center transition-all cursor-pointer",
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : isInRange
                      ? "bg-primary/20 text-foreground"
                      : isToday
                        ? "border border-primary/40 text-primary bg-primary/5 hover:bg-primary/10"
                        : "text-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {day}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
