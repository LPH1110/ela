"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"

interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

export function DatePicker({ value, onChange, placeholder = "Pick a date", className }: DatePickerProps) {
  const [open, setOpen] = useState(false)

  // Parse current selected date
  const selectedDate = useMemo(() => {
    if (!value) return null
    const parts = value.split("-")
    if (parts.length !== 3) return null
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
  }, [value])

  // Track the month and year currently displayed in the calendar
  const [viewDate, setViewDate] = useState(() => selectedDate || new Date())

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

  const handleDaySelect = (day: number) => {
    const newDate = new Date(year, month, day)
    const yyyy = newDate.getFullYear()
    const mm = String(newDate.getMonth() + 1).padStart(2, "0")
    const dd = String(newDate.getDate()).padStart(2, "0")
    onChange(`${yyyy}-${mm}-${dd}`)
    setOpen(false)
  }

  // Display value formatting
  const displayLabel = useMemo(() => {
    if (!selectedDate) return placeholder
    const day = String(selectedDate.getDate()).padStart(2, "0")
    const monthName = MONTH_NAMES[selectedDate.getMonth()].slice(0, 3)
    const yyyy = selectedDate.getFullYear()
    return `${monthName} ${day}, ${yyyy}`
  }, [selectedDate, placeholder])

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
            !value && "text-muted-foreground",
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
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((day) => (
            <span key={day} className="text-xs font-semibold text-muted-foreground/80 py-1">
              {day}
            </span>
          ))}

          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="w-8 h-8" />
            }

            const isSelected = selectedDate
              ? selectedDate.getDate() === day &&
              selectedDate.getMonth() === month &&
              selectedDate.getFullYear() === year
              : false

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
                className={cn(
                  "w-8 h-8 text-xs font-medium rounded-md flex items-center justify-center transition-all cursor-pointer",
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
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
