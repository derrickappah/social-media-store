import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const envStatus = {
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY ? "SET" : "NOT SET",
    SMMGEN_API_KEY: process.env.SMMGEN_API_KEY ? "SET" : "NOT SET",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "NOT SET",
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "NOT SET",
    GHS_TO_USD_EXCHANGE_RATE: process.env.GHS_TO_USD_EXCHANGE_RATE || "NOT SET",
  }

  // Test Supabase connection
  let supabaseTest = { status: "not_tested", error: null }
  try {
    const supabase = await createClient() // await is required - createClient is async
    if (!supabase || typeof supabase.from !== "function") {
      supabaseTest = {
        status: "error",
        error: "Supabase client not initialized correctly"
      }
    } else {
      const testQuery = await supabase.from("orders").select("id").limit(1)
      supabaseTest = {
        status: testQuery.error ? "error" : "success",
        error: testQuery.error?.message || null
      }
    }
  } catch (error) {
    supabaseTest = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }

  return NextResponse.json({
    message: "Environment and database status",
    environment: envStatus,
    database: supabaseTest,
    timestamp: new Date().toISOString()
  })
}
