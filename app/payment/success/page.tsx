"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  // Paystack can redirect with either 'reference' or 'trxref' parameter
  const reference = searchParams.get("reference") || searchParams.get("trxref")

  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [orderId, setOrderId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (reference) {
      verifyPayment(reference)
    } else {
      console.error("[v0] No reference parameter found in URL")
      setStatus("failed")
      setErrorMessage("No payment reference found. Please check your payment status.")
    }
  }, [reference])

  const verifyPayment = async (reference: string) => {
    try {
      console.log("[v0] Starting payment verification for reference:", reference)

      const response = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      })

      console.log("[v0] Verification API response status:", response.status)
      console.log("[v0] Verification API response ok:", response.ok)

      let data
      try {
        data = await response.json()
        console.log("[v0] Verification API response data:", data)
      } catch (parseError) {
        console.error("[v0] Failed to parse API response as JSON:", parseError)
        const textResponse = await response.text()
        console.error("[v0] Raw response text:", textResponse)
        setStatus("failed")
        return
      }

      if (response.ok && data.status === "success") {
        setStatus("success")
        setOrderId(data.orderId)
      } else {
        console.error("[v0] Verification failed:", data)
        console.error("[v0] Response status:", response.status)
        console.error("[v0] Response ok:", response.ok)

        // Log specific error details for debugging
        if (data.error) {
          console.error("[v0] API Error:", data.error)
          console.error("[v0] Error details:", data.details)
          setErrorMessage(data.details || data.error || "Payment verification failed")
        } else if (data.paystack_status) {
          console.error("[v0] Paystack status:", data.paystack_status)
          setErrorMessage(`Payment status: ${data.paystack_status}. Please contact support if you were charged.`)
        } else {
          setErrorMessage("Payment verification failed. Please contact support if you were charged.")
        }

        setStatus("failed")
      }
    } catch (error) {
      console.error("[v0] Payment verification network error:", error)
      setStatus("failed")
    }
  }

  if (status === "loading") {
    return (
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl">
            <div className="bg-card p-8 md:p-12 rounded-lg border shadow-sm text-center">
              <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold mb-3">Verifying Payment...</h2>
              <p className="text-muted-foreground">
                Please wait while we verify your payment with Paystack.
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (status === "failed") {
    return (
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl">
            <div className="bg-card p-8 md:p-12 rounded-lg border shadow-sm text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">Payment Verification Failed</h2>
              <p className="text-muted-foreground mb-6">
                {errorMessage || "We couldn't verify your payment. Please contact support if you were charged."}
              </p>
              {reference && (
                <p className="text-sm text-muted-foreground mb-4">
                  Reference: {reference}
                </p>
              )}
              <Button onClick={() => window.location.href = "/"}>
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl">
          <div className="bg-card p-8 md:p-12 rounded-lg border shadow-sm text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Payment Successful!</h2>
            <p className="text-muted-foreground mb-4">
              Thank you for your payment. Your order has been confirmed and is being processed.
            </p>
            {orderId && (
              <p className="text-sm text-muted-foreground mb-6">
                Order ID: {orderId}
              </p>
            )}
            <p className="text-sm text-muted-foreground mb-6">
              You'll receive a WhatsApp message with your order details and processing updates.
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
