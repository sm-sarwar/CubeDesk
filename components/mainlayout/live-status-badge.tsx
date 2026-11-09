"use client"

import { useEffect, useState } from "react"

type Props = {
  status?: string
  city?: string
  timeZone?: string
  showDate?: boolean
}

export function LiveStatusBadge({
  status = "Orders syncing live",
  city = "Dhaka",
  timeZone = "Asia/Dhaka",
  showDate = true,
}: Props) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeParts = now
    ? new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).formatToParts(now)
    : null

  const get = (type: string) => timeParts?.find((p) => p.type === type)?.value ?? "--"

  const date = now
    ? new Intl.DateTimeFormat("en-GB", {
        timeZone,
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(now)
    : ""

  return (
    
    <div className="inline-block rounded-4xl p-px">
      <div className="flex items-center gap-3 rounded-4xl bg-[#acf7d1] dark:bg-slate-950/90 px-4 py-2 font-mono text-xs dark:text-slate-300 text-[#079E8D] shadow-[0_0_40px_-8px_rgba(45,212,191,0.55)] backdrop-blur-md sm:text-sm">
        {/* pulse dot */}
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal-700 opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-teal-600" />
        </span>

        <span className="dark:text-slate-100 text-[#034E44]">{status}</span>

        <span className="h-4 w-px bg-white/15" aria-hidden />

        {/* live time */}
        <span className="flex items-baseline tabular-nums text-black dark:text-teal-200">
          <span>{get("hour")}</span>
          <span className="animate-pulse px-px">:</span>
          <span>{get("minute")}</span>
          <span className="ml-1 text-[0.7em] text-black dark:text-slate-400">{get("dayPeriod")}</span>
          <span className="ml-1.5 dark:text-slate-400 text-teal-700">, {city}</span>
        </span>

        {showDate && date && (
          <>
            <span className="hidden h-4 w-px text-teal-700 dark:bg-white/15 md:block" aria-hidden />
            <span className="hidden text-teal-700 dark:text-slate-400 md:inline">{date}</span>
          </>
        )}
      </div>
    </div>
  )
}