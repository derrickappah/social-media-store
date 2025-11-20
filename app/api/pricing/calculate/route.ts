import { type NextRequest, NextResponse } from "next/server"
import { getPricingConfig } from "@/lib/pricing"

export async function POST(request: NextRequest) {
  try {
    const { platform, serviceType, packageId } = await request.json()

    if (!platform || !serviceType || !packageId) {
      return NextResponse.json(
        { error: "Platform, serviceType, and packageId are required" },
        { status: 400 }
      )
    }

    const pricingConfig = getPricingConfig(platform, serviceType, packageId)

    if (!pricingConfig) {
      return NextResponse.json(
        { error: "Pricing configuration not found" },
        { status: 404 }
      )
    }

    // Calculate profit (assuming exchange rate)
    const exchangeRate = parseFloat(process.env.GHS_TO_USD_EXCHANGE_RATE || "12")
    const panelCostInGHS = pricingConfig.panelCost * exchangeRate
    const profit = pricingConfig.customerPrice - panelCostInGHS
    const profitMargin = (profit / pricingConfig.customerPrice) * 100

    return NextResponse.json({
      customerPrice: pricingConfig.customerPrice,
      panelCost: pricingConfig.panelCost,
      panelCurrency: pricingConfig.panelCurrency || "USD",
      panelCostInGHS,
      profit,
      profitMargin,
      exchangeRate,
    })
  } catch (error) {
    console.error("[Pricing] Calculation error:", error)
    return NextResponse.json(
      {
        error: "Failed to calculate pricing",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

