import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSMMGenServiceId, processSMMGenOrder } from "@/lib/smmgen"
import { getPricingConfig } from "@/lib/pricing"

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      )
    }

    // Get order details from database
    const supabase = await createClient()
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      console.error("[SMMGen] Order not found:", orderError)
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Check if order is already processed
    if (order.status === "processing" || order.status === "completed") {
      return NextResponse.json({
        success: true,
        message: "Order already processed",
        orderId: order.id,
      })
    }

    // Check if payment is confirmed (required before processing)
    if (order.status === "pending") {
      return NextResponse.json({
        error: "Payment not confirmed",
        details: "Order payment must be confirmed before SMMGen processing can start",
      }, { status: 400 })
    }

    // Map order to SMMGen format (returns numeric service ID)
    const serviceId = getSMMGenServiceId(order.platform, order.service_type)

    if (serviceId === null || serviceId === 0) {
      console.error("[SMMGen] Could not map service:", {
        platform: order.platform,
        serviceType: order.service_type,
      })
      return NextResponse.json(
        {
          error: "Service mapping not found",
          details: `Could not map ${order.platform} ${order.service_type} to SMMGen service ID. Please update service IDs in lib/smmgen.ts`,
        },
        { status: 400 }
      )
    }

    // Get quantity from database (preferred) or extract from package name (fallback)
    let quantity = order.quantity || 0
    
    // Fallback: Extract quantity from package name if not stored
    if (quantity === 0 || !quantity) {
      const quantityMatch = order.package_name.match(/[\d,]+/)
      quantity = quantityMatch
        ? parseInt(quantityMatch[0].replace(/,/g, ""), 10)
        : 0
    }

    if (quantity === 0) {
      return NextResponse.json(
        { error: "Could not determine quantity. Please ensure quantity is set in order." },
        { status: 400 }
      )
    }

    // Update status to "processing" before SMMGen call
    await supabase.from("orders").update({ status: "processing" }).eq("id", orderId)
    console.log("[SMMGen] Order status updated to 'processing'")

    // Process order through SMMGen
    console.log("[SMMGen] Processing order:", {
      orderId: order.id,
      serviceId,
      link: order.social_media_link,
      quantity,
    })

    const smmgenResponse = await processSMMGenOrder({
      service: serviceId,
      link: order.social_media_link,
      quantity,
    })

    // Update order status and store SMMGen order ID
    const updateData: any = {
      status: "completed",
      smmgen_order_id: smmgenResponse.order?.toString() || null,
      processed_at: new Date().toISOString(),
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)

    if (updateError) {
      console.error("[SMMGen] Failed to update order:", updateError)
      // Still return success since SMMGen order was created
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      smmgenOrderId: smmgenResponse.order,
      message: "Order processed successfully",
    })
  } catch (error) {
    console.error("[SMMGen] Processing error:", error)
    return NextResponse.json(
      {
        error: "Failed to process order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

