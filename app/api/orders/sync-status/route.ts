import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSMMGenOrderStatus, processSMMGenOrder } from "@/lib/smmgen"
import { getSMMGenServiceIdFromPackage, getSMMGenServiceId } from "@/lib/pricing"

/**
 * Sync order statuses with SMMGen API
 * This endpoint:
 * 1. Finds orders that need processing (pending, payment_confirmed, processing)
 * 2. For orders with smmgen_order_id: checks status via SMMGen API
 * 3. For orders without smmgen_order_id but payment_confirmed: processes them through SMMGen
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Find orders that need status updates
    const { data: ordersToSync, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["pending", "payment_confirmed", "processing"])
      .order("created_at", { ascending: false })
      .limit(50) // Process up to 50 orders at a time

    if (fetchError) {
      console.error("[Sync] Error fetching orders:", fetchError)
      return NextResponse.json(
        { error: "Failed to fetch orders", details: fetchError.message },
        { status: 500 }
      )
    }

    if (!ordersToSync || ordersToSync.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No orders to sync",
        processed: 0,
      })
    }

    const results = {
      processed: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const order of ordersToSync) {
      try {
        // Case 1: Order has SMMGen order ID - check status from SMMGen
        if (order.smmgen_order_id) {
          const smmgenOrderId = parseInt(order.smmgen_order_id, 10)
          
          if (!isNaN(smmgenOrderId)) {
            try {
              const statusResponse = await getSMMGenOrderStatus(smmgenOrderId)
              
              // SMMGen status response format may vary, but typically:
              // - status: "Pending", "Processing", "Completed", "Cancelled", "Partial"
              // - charge: order amount
              // - start_count: starting count
              // - status_text: human-readable status
              
              let newStatus = order.status
              
              if (statusResponse.status === "Completed" || statusResponse.status === "completed") {
                newStatus = "completed"
              } else if (statusResponse.status === "Processing" || statusResponse.status === "processing") {
                newStatus = "processing"
              } else if (statusResponse.status === "Cancelled" || statusResponse.status === "cancelled") {
                newStatus = "cancelled"
              } else if (statusResponse.status === "Pending" || statusResponse.status === "pending") {
                newStatus = "processing" // If it's pending in SMMGen, it's being processed
              }

              // Update order status if it changed
              if (newStatus !== order.status) {
                const { error: updateError } = await supabase
                  .from("orders")
                  .update({ 
                    status: newStatus,
                    ...(newStatus === "completed" && !order.processed_at && {
                      processed_at: new Date().toISOString()
                    })
                  })
                  .eq("id", order.id)

                if (updateError) {
                  console.error(`[Sync] Failed to update order ${order.id}:`, updateError)
                  results.errors.push(`Order ${order.id}: ${updateError.message}`)
                  results.failed++
                } else {
                  console.log(`[Sync] Updated order ${order.id} status: ${order.status} -> ${newStatus}`)
                  results.updated++
                }
              }
              
              results.processed++
            } catch (statusError: any) {
              console.error(`[Sync] Error checking SMMGen status for order ${order.id}:`, statusError)
              results.errors.push(`Order ${order.id}: ${statusError.message}`)
              results.failed++
            }
          }
        }
        // Case 2: Order is payment_confirmed but no SMMGen order ID - process it
        else if (order.status === "payment_confirmed" && process.env.SMMGEN_API_KEY) {
          try {
            console.log(`[Sync] Processing order ${order.id} through SMMGen`)
            
            // Get SMMGen service ID from package (preferred) or fallback to platform/service type mapping
            let serviceId: number | null = null
            
            // Try to get service ID from package_id first (allows different packages to use different SMMGen IDs)
            if (order.package_id) {
              serviceId = getSMMGenServiceIdFromPackage(
                order.platform,
                order.service_type,
                order.package_id
              )
              console.log(`[Sync] Using package-specific SMMGen service ID: ${serviceId} for package: ${order.package_id}`)
            }
            
            // Fallback to platform/service type mapping if package_id not found or service ID not found
            if (serviceId === null || serviceId === 0) {
              serviceId = getSMMGenServiceId(order.platform, order.service_type)
              console.log(`[Sync] Using fallback SMMGen service ID: ${serviceId} for platform/service: ${order.platform} ${order.service_type}`)
            }
            
            if (serviceId === null || serviceId === 0) {
              console.warn(`[Sync] No service ID for order ${order.id}: ${order.platform} ${order.service_type}`)
              results.errors.push(`Order ${order.id}: Service ID not found`)
              results.failed++
              continue
            }

            // Get quantity
            let quantity = order.quantity || 0
            if (quantity === 0) {
              const quantityMatch = order.package_name.match(/[\d,]+/)
              quantity = quantityMatch ? parseInt(quantityMatch[0].replace(/,/g, ""), 10) : 0
            }

            if (quantity === 0) {
              console.warn(`[Sync] No quantity for order ${order.id}`)
              results.errors.push(`Order ${order.id}: Quantity is 0`)
              results.failed++
              continue
            }

            // Update status to processing
            await supabase
              .from("orders")
              .update({ status: "processing" })
              .eq("id", order.id)

            // Process through SMMGen
            const smmgenResponse = await processSMMGenOrder({
              service: serviceId,
              link: order.social_media_link,
              quantity,
            })

            // Update with SMMGen order ID and mark as completed
            const { error: updateError } = await supabase
              .from("orders")
              .update({
                smmgen_order_id: smmgenResponse.order?.toString() || null,
                processed_at: new Date().toISOString(),
                status: "completed",
              })
              .eq("id", order.id)

            if (updateError) {
              console.error(`[Sync] Failed to update order ${order.id} after SMMGen processing:`, updateError)
              results.errors.push(`Order ${order.id}: ${updateError.message}`)
              results.failed++
            } else {
              console.log(`[Sync] Successfully processed order ${order.id} through SMMGen`)
              results.updated++
            }
            
            results.processed++
          } catch (processError: any) {
            console.error(`[Sync] Error processing order ${order.id} through SMMGen:`, processError)
            // Revert status back to payment_confirmed for retry
            await supabase
              .from("orders")
              .update({ status: "payment_confirmed" })
              .eq("id", order.id)
            
            results.errors.push(`Order ${order.id}: ${processError.message}`)
            results.failed++
          }
        }
        // Case 3: Order is pending - check if payment was actually confirmed
        // (This handles cases where payment verification might have failed)
        else if (order.status === "pending") {
          // For now, we'll skip pending orders that don't have payment confirmation
          // They should be handled by the payment verification webhook
          console.log(`[Sync] Skipping pending order ${order.id} - waiting for payment confirmation`)
        }
      } catch (orderError: any) {
        console.error(`[Sync] Unexpected error processing order ${order.id}:`, orderError)
        results.errors.push(`Order ${order.id}: ${orderError.message}`)
        results.failed++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} orders`,
      ...results,
    })
  } catch (error: any) {
    console.error("[Sync] Unexpected error:", error)
    return NextResponse.json(
      { 
        error: "Failed to sync order statuses",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    )
  }
}

// Also support GET for easy testing
export async function GET(request: NextRequest) {
  return POST(request)
}

