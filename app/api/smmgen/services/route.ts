import { NextResponse } from "next/server"
import { getSMMGenServices } from "@/lib/smmgen"

/**
 * Get all available services from SMMGen
 * Use this endpoint to get actual service IDs for your account
 * 
 * Example: GET /api/smmgen/services
 */
export async function GET() {
  try {
    if (!process.env.SMMGEN_API_KEY) {
      return NextResponse.json(
        { error: "SMMGEN_API_KEY environment variable is not set" },
        { status: 500 }
      )
    }

    const services = await getSMMGenServices()
    
    return NextResponse.json({
      success: true,
      services,
    })
  } catch (error) {
    console.error("[SMMGen] Services fetch error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch services",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

