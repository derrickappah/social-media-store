import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[v0] Available env vars:", {
    url: url ? "✓ set" : "✗ missing",
    key: key ? "✓ set" : "✗ missing",
    allKeys: Object.keys(process.env).filter((k) => k.includes("SUPABASE") || k.includes("NEXT_PUBLIC")),
  })

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel project settings.",
    )
  }

  return createBrowserClient(url, key)
}
