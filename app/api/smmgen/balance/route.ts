import { NextResponse } from "next/server"
import { getSMMGenBalance } from "@/lib/smmgen"

/**
 * Get SMMGen account balance
 * 
 * Example: GET /api/smmgen/balance
 */
export async function GET() {
  try {
    if (!process.env.SMMGEN_API_KEY) {
      return NextResponse.json(
        { error: "SMMGEN_API_KEY environment variable is not set" },
        { status: 500 }
      )
    }

    const balance = await getSMMGenBalance()
    
    return NextResponse.json({
      success: true,
      balance,
    })
  } catch (error) {
    console.error("[SMMGen] Balance fetch error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch balance",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

