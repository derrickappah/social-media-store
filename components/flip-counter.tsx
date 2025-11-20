"use client"

import { useEffect, useState } from "react"

interface FlipCounterProps {
  value: number
  suffix?: string
}

export function FlipCounter({ value, suffix = "" }: FlipCounterProps) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    if (value !== displayValue) {
      const timeout = setTimeout(() => {
        setDisplayValue(value)
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [value, displayValue])

  const digits = displayValue.toString().split("")

  return (
    <div className="inline-flex items-center leading-none">
      <div className="inline-flex">
        {digits.map((digit, index) => (
          <div
            key={`${index}-${displayValue}`}
            className="relative inline-block overflow-hidden"
            style={{
              height: "1.75rem",
              width: "1rem",
              lineHeight: "1.75rem",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out">
              <span className="font-bold text-2xl leading-none block" style={{ lineHeight: "1.75rem" }}>
                {digit}
              </span>
            </div>
          </div>
        ))}
      </div>
      <span className="ml-0.5 text-2xl font-bold leading-none block" style={{ lineHeight: "1.75rem" }}>
        {suffix}
      </span>
    </div>
  )
}
