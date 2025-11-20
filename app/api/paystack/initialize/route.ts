import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, orderId, email, reference } = body

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
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success?reference=${reference}`,
        metadata: {
          orderId,
        },
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to initialize Paystack payment")
    }

    const data = await response.json()

    return NextResponse.json({
      status: data.status,
      authorization_url: data.data?.authorization_url,
      access_code: data.data?.access_code,
      reference: data.data?.reference,
    })
  } catch (error) {
    console.error("[v0] Paystack initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 })
  }
}
