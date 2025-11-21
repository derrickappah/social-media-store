import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSMMGenOrderStatus, getSMMGenServiceId, processSMMGenOrder } from "@/lib/smmgen"

/**
 * Cron job endpoint to automatically sync order statuses
 * Configure in Vercel: https://vercel.com/docs/cron-jobs
 * 
 * Example vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/sync-orders",
 *     "schedule": "*/5 * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (optional but recommended)
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    
    // Find orders that need status updates
    const { data: ordersToSync, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["pending", "payment_confirmed", "processing"])
      .order("created_at", { ascending: false })
      .limit(50)

    if (fetchError) {
      console.error("[Cron] Error fetching orders:", fetchError)
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
    }

    for (const order of ordersToSync) {
      try {
        // Case 1: Order has SMMGen order ID - check status
        if (order.smmgen_order_id) {
          const smmgenOrderId = parseInt(order.smmgen_order_id, 10)
          
          if (!isNaN(smmgenOrderId)) {
            try {
              const statusResponse = await getSMMGenOrderStatus(smmgenOrderId)
              
              let newStatus = order.status
              
              if (statusResponse.status === "Completed" || statusResponse.status === "completed") {
                newStatus = "completed"
              } else if (statusResponse.status === "Processing" || statusResponse.status === "processing") {
                newStatus = "processing"
              } else if (statusResponse.status === "Cancelled" || statusResponse.status === "cancelled") {
                newStatus = "cancelled"
              } else if (statusResponse.status === "Pending" || statusResponse.status === "pending") {
                newStatus = "processing"
              }

              if (newStatus !== order.status) {
                await supabase
                  .from("orders")
                  .update({ 
                    status: newStatus,
                    ...(newStatus === "completed" && !order.processed_at && {
                      processed_at: new Date().toISOString()
                    })
                  })
                  .eq("id", order.id)

                results.updated++
              }
              
              results.processed++
            } catch (statusError) {
              console.error(`[Cron] Error checking status for order ${order.id}:`, statusError)
              results.failed++
            }
          }
        }
        // Case 2: Process payment_confirmed orders
        else if (order.status === "payment_confirmed" && process.env.SMMGEN_API_KEY) {
          try {
            const serviceId = getSMMGenServiceId(order.platform, order.service_type)
            
            if (serviceId === null || serviceId === 0) {
              results.failed++
              continue
            }

            let quantity = order.quantity || 0
            if (quantity === 0) {
              const quantityMatch = order.package_name.match(/[\d,]+/)
              quantity = quantityMatch ? parseInt(quantityMatch[0].replace(/,/g, ""), 10) : 0
            }

            if (quantity === 0) {
              results.failed++
              continue
            }

            await supabase
              .from("orders")
              .update({ status: "processing" })
              .eq("id", order.id)

            const smmgenResponse = await processSMMGenOrder({
              service: serviceId,
              link: order.social_media_link,
              quantity,
            })

            await supabase
              .from("orders")
              .update({
                smmgen_order_id: smmgenResponse.order?.toString() || null,
                processed_at: new Date().toISOString(),
                status: "completed",
              })
              .eq("id", order.id)

            results.updated++
            results.processed++
          } catch (processError) {
            console.error(`[Cron] Error processing order ${order.id}:`, processError)
            await supabase
              .from("orders")
              .update({ status: "payment_confirmed" })
              .eq("id", order.id)
            results.failed++
          }
        }
      } catch (orderError) {
        console.error(`[Cron] Error processing order ${order.id}:`, orderError)
        results.failed++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} orders`,
      ...results,
    })
  } catch (error: any) {
    console.error("[Cron] Unexpected error:", error)
    return NextResponse.json(
      { 
        error: "Failed to sync order statuses",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    )
  }
}

