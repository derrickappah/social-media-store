import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { processSMMGenOrder } from "@/lib/smmgen"
import { getSMMGenServiceIdFromPackage, getSMMGenServiceId } from "@/lib/pricing"

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ 
        status: "failed", 
        error: "No payment reference provided" 
      }, { status: 400 })
    }

    console.log("[v0] Verifying payment with reference:", reference)
    console.log("[v0] PAYSTACK_SECRET_KEY present:", !!process.env.PAYSTACK_SECRET_KEY)

    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY environment variable is not set")
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Paystack API error:", response.status, errorText)
      throw new Error(`Paystack API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Paystack verification response:", {
      status: data.status,
      data_status: data.data?.status,
      orderId: data.data?.metadata?.orderId,
      reference: data.data?.reference,
      amount: data.data?.amount,
      full_response: JSON.stringify(data, null, 2)
    })

    // Check if Paystack API returned an error
    if (data.status === false) {
      console.error("[v0] Paystack API returned error:", data.message)
      return NextResponse.json({ 
        status: "failed", 
        error: "Payment verification failed",
        details: data.message || "Invalid payment reference"
      }, { status: 400 })
    }

    // Check if transaction was successful
    if (data.data?.status === "success" || data.status === "success") {
      // Try multiple ways to get orderId from metadata
      const orderId = data.data?.metadata?.orderId || 
                      data.data?.metadata?.custom_fields?.find((f: any) => f.variable_name === "orderId")?.value ||
                      data.metadata?.orderId

      if (!orderId) {
        console.error("[v0] No orderId found in Paystack metadata")
        console.error("[v0] Available metadata:", JSON.stringify(data.data?.metadata || data.metadata, null, 2))
        // Still return success if payment was verified, just without orderId
        return NextResponse.json({ 
          status: "success", 
          warning: "Payment verified but order ID not found in metadata"
        })
      }

      // Update order status in Supabase
      let supabase
      try {
        supabase = await createClient()
        console.log("[v0] Supabase client created successfully")
      } catch (supabaseError) {
        console.error("[v0] Failed to create Supabase client:", supabaseError)
        return NextResponse.json({
          status: "failed",
          error: "Database connection failed",
          details: "Failed to initialize Supabase client"
        }, { status: 500 })
      }

      // Step 1: Update order status to "payment_confirmed" (payment verified, SMMGen processing not started yet)
      const updateResult = await supabase.from("orders").update({ status: "payment_confirmed" }).eq("id", orderId)
      console.log("[v0] Database update result (payment_confirmed):", updateResult)

      if (updateResult.error) {
        console.error("[v0] Database update error:", updateResult.error)
        // Payment was successful on Paystack, but database update failed
        // Still return success since payment went through
        console.warn("[v0] Payment verified on Paystack but database update failed. Payment was successful.")
        return NextResponse.json({ 
          status: "success", 
          orderId,
          warning: "Payment verified but database update failed. Please check order status manually."
        })
      }

      console.log("[v0] Payment confirmed - order status updated to 'payment_confirmed'")

      // Get order details for SMMGen processing
      const { data: orderDetails } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single()

      // Step 2: Process order through SMMGen API (automatically triggered after payment confirmation)
      if (orderDetails && process.env.SMMGEN_API_KEY) {
        try {
          // Step 2a: Update status to "processing" (SMMGen processing started)
          await supabase.from("orders").update({ status: "processing" }).eq("id", orderId)
          console.log("[v0] Order status updated to 'processing' - starting SMMGen processing")
          
          console.log("[v0] Processing order through SMMGen:", orderId)
          
          // Get SMMGen service ID from package (preferred) or fallback to platform/service type mapping
          let serviceId: number | null = null
          
          // Try to get service ID from package_id first (allows different packages to use different SMMGen IDs)
          if (orderDetails.package_id) {
            serviceId = getSMMGenServiceIdFromPackage(
              orderDetails.platform,
              orderDetails.service_type,
              orderDetails.package_id
            )
            console.log("[v0] Using package-specific SMMGen service ID:", serviceId, "for package:", orderDetails.package_id)
          }
          
          // Fallback to platform/service type mapping if package_id not found or service ID not found
          if (serviceId === null || serviceId === 0) {
            serviceId = getSMMGenServiceId(orderDetails.platform, orderDetails.service_type)
            console.log("[v0] Using fallback SMMGen service ID:", serviceId, "for platform/service:", orderDetails.platform, orderDetails.service_type)
          }
          
          if (serviceId !== null && serviceId > 0) {
            // Get quantity from database (preferred) or extract from package name (fallback)
            let quantity = orderDetails.quantity || 0
            
            // Fallback: Extract quantity from package name if not stored
            if (quantity === 0 || !quantity) {
              const quantityMatch = orderDetails.package_name.match(/[\d,]+/)
              quantity = quantityMatch
                ? parseInt(quantityMatch[0].replace(/,/g, ""), 10)
                : 0
            }

            if (quantity > 0) {
              console.log("[v0] Processing order through SMMGen:", {
                orderId: orderId,
                platform: orderDetails.platform,
                serviceType: orderDetails.service_type,
                serviceId: serviceId,
                quantity: quantity,
                link: orderDetails.social_media_link,
                customerPrice: orderDetails.package_price,
                panelCost: orderDetails.panel_cost || "Not set",
              })

              // Process order through SMMGen API
              const smmgenResponse = await processSMMGenOrder({
                service: serviceId,
                link: orderDetails.social_media_link,
                quantity: quantity, // Send the exact quantity (likes/followers/views)
              })

              console.log("[v0] SMMGen order processed successfully:", smmgenResponse)
              
              // Step 2b: Update order with SMMGen order ID and mark as "completed"
              await supabase.from("orders").update({ 
                smmgen_order_id: smmgenResponse.order?.toString() || null,
                processed_at: new Date().toISOString(),
                status: "completed"
              }).eq("id", orderId)
              
              console.log("[v0] Order status updated to 'completed' - SMMGen processing finished")
              
              return NextResponse.json({ 
                status: "success", 
                orderId,
                smmgenOrderId: smmgenResponse.order,
                message: "Payment confirmed and order processed successfully through SMMGen"
              })
            } else {
              console.warn("[v0] Quantity is 0, cannot process order")
              // Update back to payment_confirmed since we can't process
              await supabase.from("orders").update({ status: "payment_confirmed" }).eq("id", orderId)
            }
          } else {
            console.warn("[v0] Service ID not found for platform/serviceType")
            // Update back to payment_confirmed since we can't process
            await supabase.from("orders").update({ status: "payment_confirmed" }).eq("id", orderId)
          }
        } catch (smmgenError) {
          console.error("[v0] SMMGen processing error:", smmgenError)
          // Payment was successful, but SMMGen processing failed
          // Order status remains "payment_confirmed" - can be retried later
          // Update status back to payment_confirmed so it can be retried
          await supabase.from("orders").update({ status: "payment_confirmed" }).eq("id", orderId)
          console.warn("[v0] SMMGen processing failed, order status set back to 'payment_confirmed' for retry")
        }
      } else if (!process.env.SMMGEN_API_KEY) {
        console.warn("[v0] SMMGEN_API_KEY not set, skipping SMMGen processing")
        // Payment confirmed but SMMGen not configured - mark as completed
        await supabase.from("orders").update({ status: "completed" }).eq("id", orderId)
      } else {
        // No order details found
        console.warn("[v0] Order details not found, marking as completed")
        await supabase.from("orders").update({ status: "completed" }).eq("id", orderId)
      }

      // If SMMGen processing wasn't attempted or failed, still mark as completed
      // (payment was successful)
      // Note: This should rarely be reached due to the conditions above
      if (orderDetails && !process.env.SMMGEN_API_KEY) {
        await supabase.from("orders").update({ status: "completed" }).eq("id", orderId)
      }
      
      return NextResponse.json({ status: "success", orderId })
    }

    console.log("[v0] Payment verification failed - status:", data.data?.status)
    return NextResponse.json({ status: "failed", paystack_status: data.data?.status }, { status: 400 })
  } catch (error) {
    console.error("[v0] Paystack verification error:", error)
    return NextResponse.json({ error: "Failed to verify payment", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
