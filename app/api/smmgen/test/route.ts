import { type NextRequest, NextResponse } from "next/server"
import { getSMMGenServiceId, processSMMGenOrder } from "@/lib/smmgen"

/**
 * Test SMMGen API directly without going through payment flow
 * 
 * POST /api/smmgen/test
 * 
 * Body:
 * {
 *   "platform": "TikTok",
 *   "serviceType": "Likes",
 *   "link": "https://tiktok.com/@test/video/123",
 *   "quantity": 1000
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, serviceType, link, quantity, serviceId: manualServiceId } = body

    // Validate required fields
    if (!link || !quantity) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: manualServiceId ? ["link", "quantity"] : ["platform", "serviceType", "link", "quantity"],
          received: { platform, serviceType, link, quantity, serviceId: manualServiceId },
        },
        { status: 400 }
      )
    }

    // Validate quantity
    const quantityNum = parseInt(quantity.toString(), 10)
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return NextResponse.json(
        {
          error: "Invalid quantity",
          details: "Quantity must be a positive number",
        },
        { status: 400 }
      )
    }

    // Check if SMMGen API key is set
    if (!process.env.SMMGEN_API_KEY) {
      return NextResponse.json(
        {
          error: "SMMGEN_API_KEY not configured",
          details: "Please set SMMGEN_API_KEY in your .env.local file",
        },
        { status: 500 }
      )
    }

    console.log("[SMMGen Test] Starting test order:", {
      platform,
      serviceType,
      link,
      quantity: quantityNum,
      manualServiceId,
    })

    // Use manual service ID if provided, otherwise map from platform/serviceType
    let serviceId: number | null = null

    if (manualServiceId) {
      serviceId = parseInt(manualServiceId.toString(), 10)
      if (isNaN(serviceId) || serviceId <= 0) {
        return NextResponse.json(
          {
            error: "Invalid service ID",
            details: "Manual service ID must be a positive number",
          },
          { status: 400 }
        )
      }
      console.log("[SMMGen Test] Using manual service ID:", serviceId)
    } else {
      // Validate platform and serviceType if not using manual ID
      if (!platform || !serviceType) {
        return NextResponse.json(
          {
            error: "Missing required fields",
            details: "Either provide serviceId directly, or provide both platform and serviceType",
            required: ["platform", "serviceType", "link", "quantity"],
          },
          { status: 400 }
        )
      }

      // Map service to SMMGen service ID
      serviceId = getSMMGenServiceId(platform, serviceType)

      if (serviceId === null || serviceId === 0) {
        return NextResponse.json(
          {
            error: "Service mapping not found",
            details: `Could not map ${platform} ${serviceType} to SMMGen service ID`,
            help: "Please update service IDs in lib/smmgen.ts, use manual service ID option, or call /api/smmgen/services to get actual IDs",
          },
          { status: 400 }
        )
      }

      console.log("[SMMGen Test] Mapped service:", {
        platform,
        serviceType,
        serviceId,
      })
    }

    // Process order through SMMGen
    try {
      const smmgenResponse = await processSMMGenOrder({
        service: serviceId,
        link: link,
        quantity: quantityNum,
      })

      console.log("[SMMGen Test] Order processed successfully:", smmgenResponse)

      return NextResponse.json({
        success: true,
        message: "Test order processed successfully through SMMGen",
        testData: {
          ...(platform && { platform }),
          ...(serviceType && { serviceType }),
          serviceId,
          link,
          quantity: quantityNum,
          ...(manualServiceId && { manualServiceId: true }),
        },
        smmgenResponse: {
          orderId: smmgenResponse.order,
          status: smmgenResponse.status,
          message: smmgenResponse.message,
        },
        nextSteps: [
          "Check your SMMGen panel to verify the order was created",
          "Verify the service ID, link, and quantity are correct",
          "If successful, your service IDs are configured correctly",
        ],
      })
    } catch (smmgenError: any) {
      console.error("[SMMGen Test] Order processing failed:", smmgenError)

      return NextResponse.json(
        {
          success: false,
          error: "Failed to process order through SMMGen",
          details: smmgenError.message || "Unknown error",
          testData: {
            ...(platform && { platform }),
            ...(serviceType && { serviceType }),
            serviceId,
            link,
            quantity: quantityNum,
            ...(manualServiceId && { manualServiceId: true }),
          },
          troubleshooting: [
            "Check if SMMGen API key is valid",
            "Verify service ID is correct for your SMMGen account",
            "Check if link format is valid",
            "Verify quantity is within service limits",
            "Check SMMGen panel for any account issues",
          ],
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("[SMMGen Test] Error:", error)
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to show test form/instructions
 */
export async function GET() {
  return NextResponse.json({
    message: "SMMGen API Test Endpoint",
    description: "Test SMMGen order processing without going through payment flow",
    usage: {
      method: "POST",
      endpoint: "/api/smmgen/test",
      body: {
        platform: "TikTok | Instagram | Facebook | YouTube | Twitter",
        serviceType: "Likes | Followers | Comments | Saves | Views",
        link: "https://... (your social media link)",
        quantity: 1000, // number of likes/followers/views
      },
    },
    example: {
      platform: "TikTok",
      serviceType: "Likes",
      link: "https://tiktok.com/@test/video/123",
      quantity: 1000,
    },
    testCommand: `curl -X POST http://localhost:3000/api/smmgen/test \\
  -H "Content-Type: application/json" \\
  -d '{
    "platform": "TikTok",
    "serviceType": "Likes",
    "link": "https://tiktok.com/@test/video/123",
    "quantity": 1000
  }'`,
  })
}

