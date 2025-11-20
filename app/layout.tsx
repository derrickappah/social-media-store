import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "BoostUp Ghana - Grow Your Social Media Fast",
  description:
    "Buy real engagement and followers to grow your social media fast. Trusted by thousands of creators in Ghana.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
