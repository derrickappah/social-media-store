import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, orderId, email, reference } = body

    // Validate required fields
    if (!email || !amount || !reference) {
      console.error("[v0] Missing required fields:", { email: !!email, amount: !!amount, reference: !!reference })
      return NextResponse.json(
        { 
          error: "Missing required fields",
          details: "Email, amount, and reference are required"
        },
        { status: 400 }
      )
    }

    // Check if Paystack secret key is configured
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error("[v0] PAYSTACK_SECRET_KEY not configured")
      return NextResponse.json(
        { 
          error: "Payment service not configured",
          details: "Please contact support"
        },
        { status: 500 }
      )
    }

    // Get base URL - handle mobile and desktop
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                    'http://localhost:3000'
    
    const callbackUrl = `${baseUrl}/payment/success?reference=${reference}`

    console.log("[v0] Initializing Paystack payment:", {
      email,
      amount: amount * 100,
      reference,
      callbackUrl,
      orderId,
    })

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100,
        reference,
        callback_url: callbackUrl,
        metadata: {
          orderId,
        },
      }),
    })

    const responseText = await response.text()
    let data

    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("[v0] Failed to parse Paystack response:", responseText)
      return NextResponse.json(
        { 
          error: "Invalid response from payment service",
          details: "Please try again or contact support"
        },
        { status: 500 }
      )
    }

    if (!response.ok) {
      console.error("[v0] Paystack API error:", {
        status: response.status,
        statusText: response.statusText,
        data: data,
      })
      
      return NextResponse.json(
        { 
          error: "Failed to initialize payment",
          details: data.message || `Paystack API error: ${response.status}`,
          paystackError: data.message,
        },
        { status: response.status || 500 }
      )
    }

    if (data.status !== true && data.status !== "success") {
      console.error("[v0] Paystack returned unsuccessful status:", data)
      return NextResponse.json(
        { 
          error: "Payment initialization failed",
          details: data.message || "Unable to initialize payment. Please try again.",
          paystackMessage: data.message,
        },
        { status: 400 }
      )
    }

    if (!data.data?.authorization_url) {
      console.error("[v0] No authorization URL in Paystack response:", data)
      return NextResponse.json(
        { 
          error: "Invalid response from payment service",
          details: "Authorization URL not received. Please try again.",
        },
        { status: 500 }
      )
    }

    console.log("[v0] Paystack payment initialized successfully:", {
      reference: data.data.reference,
      authorization_url: data.data.authorization_url,
    })

    return NextResponse.json({
      status: data.status,
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    })
  } catch (error) {
    console.error("[v0] Paystack initialization error:", error)
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorDetails = error instanceof Error && error.cause ? String(error.cause) : undefined

    return NextResponse.json(
      { 
        error: "Failed to initialize payment",
        details: errorMessage,
        ...(errorDetails && { cause: errorDetails }),
      },
      { status: 500 }
    )
  }
}
