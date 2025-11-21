"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Order {
  id: string
  created_at: string
  platform: string
  service_type: string
  package_name: string
  package_price: number
  social_media_link: string
  status: "pending" | "payment_confirmed" | "processing" | "completed" | "cancelled"
  full_name: string
  email: string
  phone: string
  user_id?: string | null
  quantity?: number | null
  smmgen_order_id?: string | null
  processed_at?: string | null
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  },
  payment_confirmed: {
    label: "Payment Confirmed",
    icon: CheckCircle2,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-500/10 text-red-600 border-red-500/20",
  },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const router = useRouter()
  
  // Create a stable supabase client reference
  const supabase = useMemo(() => createClient(), [])

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Error getting session:", sessionError)
        setError("Failed to authenticate. Please try logging in again.")
        setLoading(false)
        return
      }

      if (!session?.user) {
        router.push("/")
        return
      }

      setUser(session.user)

        // Try to fetch orders by user_id first (if column exists)
        let ordersData: Order[] = []
        let useEmailFallback = false

        try {
          const { data, error: queryError } = await supabase
            .from("orders")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })

          if (queryError) {
            // Check if error is due to missing column or RLS policy
            const errorMessage = queryError.message || ""
            const isColumnError = 
              errorMessage.includes("user_id") || 
              errorMessage.includes("column") ||
              errorMessage.includes("schema cache") ||
              queryError.code === "PGRST116" // Column not found

            if (isColumnError) {
              console.warn("user_id column not found, falling back to email lookup:", queryError.message)
              useEmailFallback = true
            } else {
              console.error("Error fetching orders by user_id:", {
                error: queryError,
                message: queryError.message,
                details: queryError.details,
                hint: queryError.hint,
                code: queryError.code,
              })
              // Try email fallback for RLS or other errors
              useEmailFallback = true
            }
          } else {
            ordersData = (data || []) as Order[]
            // If no orders found by user_id, try email as fallback
            if (ordersData.length === 0 && session.user.email) {
              useEmailFallback = true
            }
          }
        } catch (err) {
          console.error("Exception fetching orders by user_id:", err)
          useEmailFallback = true
        }

        // Fallback: try fetching by email if user_id query failed or returned no results
        if (useEmailFallback && session.user.email) {
          try {
            const { data: ordersByEmail, error: emailError } = await supabase
              .from("orders")
              .select("*")
              .eq("email", session.user.email)
              .order("created_at", { ascending: false })

            if (emailError) {
              console.error("Error fetching orders by email:", {
                error: emailError,
                message: emailError.message,
                details: emailError.details,
                hint: emailError.hint,
                code: emailError.code,
              })
              
              // Check if it's an RLS policy issue
              if (emailError.code === "42501" || emailError.message?.includes("policy")) {
                setError("Permission denied. Please check your account permissions.")
              } else {
                setError("Failed to load orders. Please try again later.")
              }
              setOrders([])
            } else {
              setOrders((ordersByEmail || []) as Order[])
            }
          } catch (err) {
            console.error("Exception fetching orders by email:", err)
            setError("An unexpected error occurred while loading orders.")
            setOrders([])
          }
        } else {
          setOrders(ordersData)
        }
    } catch (err) {
      console.error("Unexpected error in fetchOrders:", err)
      setError("An unexpected error occurred. Please try again.")
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  useEffect(() => {
    fetchOrders()

    // Auto-refresh orders every 30 seconds if there are pending/processing orders
    const interval = setInterval(() => {
      setOrders((currentOrders) => {
        const hasActiveOrders = currentOrders.some(
          (order) => order.status === "pending" || order.status === "payment_confirmed" || order.status === "processing"
        )
        
        if (hasActiveOrders) {
          // Trigger sync API to update statuses
          fetch("/api/orders/sync-status", { method: "POST" }).catch(console.error)
          
          // Refresh orders
          fetchOrders()
        }
        
        return currentOrders
      })
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [fetchOrders])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container px-4 py-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container px-4 py-12 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">My Orders</h1>
              <p className="text-muted-foreground">
                Track the status of all your orders in one place
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setSyncing(true)
                try {
                  await fetch("/api/orders/sync-status", { method: "POST" })
                  await fetchOrders()
                } catch (err) {
                  console.error("Sync failed:", err)
                } finally {
                  setSyncing(false)
                }
              }}
              disabled={syncing || loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync Status"}
            </Button>
          </div>

          {error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Orders</h3>
                <p className="text-muted-foreground text-center mb-6">{error}</p>
                <div className="flex gap-2">
                  <Button onClick={() => window.location.reload()}>Retry</Button>
                  <Button asChild variant="outline">
                    <Link href="/#order">Place an Order</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground text-center mb-6">
                  You haven't placed any orders yet. Start by placing your first order!
                </p>
                <Button asChild>
                  <Link href="/#order">Place an Order</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusInfo = statusConfig[order.status]
                const StatusIcon = statusInfo.icon

                return (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {order.service_type} - {order.package_name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Order ID: {order.id.slice(0, 8)}...
                          </CardDescription>
                        </div>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Platform:</span>
                            <span>{order.platform}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Price:</span>
                            <span className="font-semibold text-primary">GHS {order.package_price}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Date:</span>
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Link:</span>
                            <a
                              href={order.social_media_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate max-w-[200px]"
                            >
                              {order.social_media_link}
                            </a>
                          </div>
                          {order.quantity && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">Quantity:</span>
                              <span>{order.quantity.toLocaleString()}</span>
                            </div>
                          )}
                          {order.smmgen_order_id && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">SMMGen ID:</span>
                              <span className="font-mono text-xs">{order.smmgen_order_id}</span>
                            </div>
                          )}
                          {order.processed_at && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">Processed:</span>
                              <span>{new Date(order.processed_at).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

