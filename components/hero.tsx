"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Users, Heart, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { FlipCounter } from "./flip-counter"

function useContinuousCounter(initialValue: number) {
  const [count, setCount] = useState(initialValue)

  useEffect(() => {
    const scheduleNextIncrement = () => {
      // Generate random odd number of seconds between 1 and 9 (1, 3, 5, 7, 9)
      const oddSeconds = [1, 3, 5, 7, 9]
      const randomOddSeconds = oddSeconds[Math.floor(Math.random() * oddSeconds.length)]

      setTimeout(() => {
        setCount((prev) => prev + 1) // Increment by 1 to ensure only one digit changes
        scheduleNextIncrement() // Schedule the next increment
      }, randomOddSeconds * 1000)
    }

    scheduleNextIncrement()
  }, [])

  return count
}

export function Hero() {
  const likesCount = useContinuousCounter(50)
  const followersCount = useContinuousCounter(25)

  return (
    <section className="relative overflow-hidden border-b border-border/40 bg-background">
      <div className="container px-4 sm:px-6 py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 sm:mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <span className="text-muted-foreground">Trusted by 10,000+ creators in Ghana</span>
          </div>

          <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-balance leading-tight">
            Grow Your Social Media <span className="text-primary">Fast</span>
          </h1>

          <p className="mb-8 sm:mb-10 text-base sm:text-lg md:text-xl text-muted-foreground text-balance leading-relaxed px-4 sm:px-0">
            Buy real engagement and followers to boost your social media presence. Instant delivery, affordable prices,
            and 100% secure.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="#order-form">
                View Packages
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto bg-transparent">
              <Link href="https://wa.me/233551234567" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Us
              </Link>
            </Button>
          </div>

          <div className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8">
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">
                <FlipCounter value={likesCount} suffix="K+" />
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Likes Delivered</p>
            </div>
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">
                <FlipCounter value={followersCount} suffix="K+" />
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Followers Gained</p>
            </div>
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">98%</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
