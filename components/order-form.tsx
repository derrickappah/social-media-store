"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Heart,
  Users,
  MessageSquare,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  Eye,
  Bookmark,
  CheckCircle2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const products = {
  likes: [
    { id: "likes_1k", amount: 1000, price: 10, label: "1,000 Likes - GHS 10" },
    { id: "likes_5k", amount: 5000, price: 45, label: "5,000 Likes - GHS 45" },
    { id: "likes_10k", amount: 10000, price: 80, label: "10,000 Likes - GHS 80" },
  ],
  followers: [
    { id: "followers_500", amount: 500, price: 15, label: "500 Followers - GHS 15" },
    { id: "followers_1k", amount: 1000, price: 25, label: "1,000 Followers - GHS 25" },
    { id: "followers_5k", amount: 5000, price: 100, label: "5,000 Followers - GHS 100" },
  ],
  comments: [
    { id: "comments_50", amount: 50, price: 10, label: "50 Comments - GHS 10" },
    { id: "comments_100", amount: 100, price: 18, label: "100 Comments - GHS 18" },
  ],
  saves: [
    { id: "saves_500", amount: 500, price: 12, label: "500 Saves - GHS 12" },
    { id: "saves_1k", amount: 1000, price: 20, label: "1,000 Saves - GHS 20" },
    { id: "saves_5k", amount: 5000, price: 90, label: "5,000 Saves - GHS 90" },
  ],
  views: [
    { id: "views_1k", amount: 1000, price: 8, label: "1,000 Views - GHS 8" },
    { id: "views_5k", amount: 5000, price: 35, label: "5,000 Views - GHS 35" },
    { id: "views_10k", amount: 10000, price: 65, label: "10,000 Views - GHS 65" },
  ],
}

const socialMediaPlatforms = ["TikTok", "Instagram", "Facebook", "YouTube", "Twitter"]

const paymentMethods = ["Paystack"]

export function OrderForm() {
  const [user, setUser] = useState<any>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)

  const [socialMedia, setSocialMedia] = useState<string>("")
  const [serviceType, setServiceType] = useState<string>("")
  const [selectedPackage, setSelectedPackage] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [socialLink, setSocialLink] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [screenshot, setScreenshot] = useState<File | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [orderSuccess, setOrderSuccess] = useState(false)

  // Check if user is logged in and auto-fill information
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        // Auto-fill user information
        setFullName(session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "")
        setEmail(session.user.email || "")
        // Start at step 2 (Select Social Media Platform) if user is logged in
        setCurrentStep(2)
      }
      setIsLoadingUser(false)
    }

    checkUser()
  }, [])

  const getPackages = () => {
    if (serviceType === "likes") return products.likes
    if (serviceType === "followers") return products.followers
    if (serviceType === "comments") return products.comments
    if (serviceType === "saves") return products.saves
    if (serviceType === "views") return products.views
    return []
  }

  const getSelectedPrice = () => {
    const packages = getPackages()
    const pkg = packages.find((p) => p.id === selectedPackage)
    return pkg?.price || 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const supabase = createClient()

      // Get current user (if authenticated)
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      // Upload screenshot to Supabase Storage
      let screenshotUrl = null
      if (screenshot) {
        const fileExt = screenshot.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `payment-screenshots/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("orders")
          .upload(filePath, screenshot)

        if (uploadError) {
          throw new Error(`Failed to upload screenshot: ${uploadError.message}`)
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("orders").getPublicUrl(filePath)

        screenshotUrl = publicUrl
      }

      // Get package details
      const packages = getPackages()
      const pkg = packages.find((p) => p.id === selectedPackage)

      // Get pricing configuration for panel costs via API
      let pricingData = null
      try {
        const pricingResponse = await fetch("/api/pricing/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform: socialMedia,
            serviceType: serviceType.charAt(0).toUpperCase() + serviceType.slice(1),
            packageId: selectedPackage,
          }),
        })
        
        if (pricingResponse.ok) {
          pricingData = await pricingResponse.json()
        }
      } catch (error) {
        console.warn("Could not fetch pricing config:", error)
      }

      // Extract quantity from package (more reliable than parsing later)
      const quantity = pkg?.amount || 0

      // Build order data object
      const orderDataToInsert: any = {
        full_name: fullName,
        phone: phone,
        email: email,
        platform: socialMedia,
        service_type: serviceType.charAt(0).toUpperCase() + serviceType.slice(1),
        package_name: pkg?.label || "",
        package_price: pkg?.price || 0,
        quantity: quantity, // Store quantity directly
        social_media_link: socialLink,
        payment_method: "Paystack",
        screenshot_url: null,
        status: "pending",
      }

      // Add pricing information if available
      if (pricingData) {
        orderDataToInsert.panel_cost = pricingData.panelCost
        orderDataToInsert.panel_currency = pricingData.panelCurrency || "USD"
        orderDataToInsert.profit = pricingData.profit
        orderDataToInsert.profit_margin = pricingData.profitMargin
      }

      // Try to insert with user_id if user is logged in
      // If column doesn't exist, retry without it
      let orderData
      let insertError

      if (user?.id) {
        // Try with user_id first
        const orderDataWithUserId = { ...orderDataToInsert, user_id: user.id }
        const result = await supabase.from("orders").insert(orderDataWithUserId).select()
        orderData = result.data
        insertError = result.error

        // If error is about missing user_id column, retry without it
        if (insertError && insertError.message?.includes("user_id") && insertError.message?.includes("schema cache")) {
          console.warn("user_id column not found, inserting order without user_id. Please run migration script.")
          const retryResult = await supabase.from("orders").insert(orderDataToInsert).select()
          orderData = retryResult.data
          insertError = retryResult.error
        }
      } else {
        // No user, insert without user_id
        const result = await supabase.from("orders").insert(orderDataToInsert).select()
        orderData = result.data
        insertError = result.error
      }

      if (insertError) {
        throw new Error(`Failed to save order: ${insertError.message}`)
      }

      const paystackResponse = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: pkg?.price || 0,
          orderId: orderData?.[0]?.id,
          email: email,
          reference: `order_${orderData?.[0]?.id}_${Date.now()}`,
        }),
      })

      const paystackData = await paystackResponse.json()

      if (!paystackResponse.ok) {
        // Extract detailed error message from response
        const errorMessage = paystackData.details || paystackData.error || "Failed to initialize Paystack payment"
        console.error("[v0] Paystack initialization failed:", {
          status: paystackResponse.status,
          error: paystackData,
        })
        throw new Error(errorMessage)
      }

      if (paystackData.error) {
        const errorMessage = paystackData.details || paystackData.error || "Failed to initialize payment"
        throw new Error(errorMessage)
      }

      if (paystackData.authorization_url) {
        // Use window.location for better mobile compatibility
        window.location.href = paystackData.authorization_url
      } else {
        console.error("[v0] No authorization URL in response:", paystackData)
        throw new Error(paystackData.details || "Failed to get payment authorization URL. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Order submission error:", error)
      setSubmitError(error instanceof Error ? error.message : "Failed to submit order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // If user is logged in, step 1 is skipped, so validation is different
  const isStep1Valid = user ? true : fullName !== "" && phone !== "" && email !== ""
  const isStep2Valid = user ? (socialMedia !== "" && phone !== "") : socialMedia !== ""
  const isStep3Valid = serviceType !== "" && selectedPackage !== "" && socialLink !== ""

  // For logged-in users, step 2 becomes the first step
  const canProceedToStep2 = user ? isStep2Valid : isStep1Valid
  const canProceedToStep3 = isStep2Valid
  const canSubmit = isStep3Valid

  // Determine which steps to show based on login status
  const totalSteps = user ? 2 : 3
  const getStepNumber = (step: number) => (user ? step + 1 : step)

  if (orderSuccess) {
    return (
      <section id="order" className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl">
            <div className="bg-card p-8 md:p-12 rounded-lg border shadow-sm text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">Order Placed Successfully!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for your order! We've received your payment and will start processing your request shortly.
                You'll receive a confirmation message on WhatsApp.
              </p>
              <Button
                size="lg"
                onClick={() => {
                  setOrderSuccess(false)
                  setCurrentStep(user ? 2 : 1)
                  if (!user) {
                    setFullName("")
                    setPhone("")
                    setEmail("")
                  }
                  setSocialMedia("")
                  setServiceType("")
                  setSelectedPackage("")
                  setPaymentMethod("")
                  setSocialLink("")
                  setScreenshot(null)
                }}
              >
                Place Another Order
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="order" className="py-20 md:py-32 bg-muted/30">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl mb-4">
            Choose Your Package
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Fill out the form below to place your order. We'll contact you on WhatsApp to confirm.
          </p>
        </div>

        <div className="mx-auto max-w-lg sm:max-w-2xl">
          <div className="mb-6 flex items-center justify-center gap-1 px-2">
            {(user ? [1, 2] : [1, 2, 3]).map((step) => {
              // Map step numbers: if user is logged in, step 1 = platform, step 2 = service
              // If not logged in, step 1 = personal info, step 2 = platform, step 3 = service
              const actualStep = user ? step + 1 : step
              const isActive = currentStep === actualStep
              const isCompleted = currentStep > actualStep
              
              return (
                <div key={step} className="flex items-center">
                  <div
                    className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 text-xs sm:text-sm font-semibold transition-colors ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : isCompleted
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted-foreground/30 bg-muted text-muted-foreground"
                    }`}
                  >
                    {step}
                  </div>
                  {step < (user ? 2 : 3) && (
                    <div
                      className={`h-0.5 w-6 sm:w-12 transition-colors ${
                        isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-card p-4 sm:p-6 md:p-8 rounded-lg border shadow-sm">
            {!user && currentStep === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Please provide your contact details
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name *</Label>
                  <Input
                    id="full-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mt-6">
                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    onClick={() => setCurrentStep(2)}
                    disabled={!canProceedToStep2}
                  >
                    Next
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">Select Social Media Platform</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose the platform where you want to boost engagement
                  </p>
                </div>

                {user && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="social-media">Social Media Platform *</Label>
                  <Select
                    value={socialMedia}
                    onValueChange={(value) => {
                      setSocialMedia(value)
                      setServiceType("")
                      setSelectedPackage("")
                    }}
                  >
                    <SelectTrigger id="social-media" className="h-12">
                      <SelectValue placeholder="Select social media platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {socialMediaPlatforms.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className={`flex flex-row gap-3 mt-6 ${user ? "justify-end" : ""}`}>
                  {!user && (
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => setCurrentStep(1)}
                    >
                      <ChevronLeft className="mr-2 h-5 w-5" />
                      Back
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="lg"
                    className={user ? "w-full" : "flex-1"}
                    onClick={() => setCurrentStep(3)}
                    disabled={!canProceedToStep3}
                  >
                    Next
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">Choose Service & Package</h3>
                  <p className="text-sm text-muted-foreground">Select the type of engagement and package size</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-type">Service Type *</Label>
                  <Select
                    value={serviceType}
                    onValueChange={(value) => {
                      setServiceType(value)
                      setSelectedPackage("")
                    }}
                  >
                    <SelectTrigger id="service-type" className="h-12">
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="likes">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          Likes
                        </div>
                      </SelectItem>
                      <SelectItem value="followers">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Followers
                        </div>
                      </SelectItem>
                      <SelectItem value="comments">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Comments
                        </div>
                      </SelectItem>
                      <SelectItem value="saves">
                        <div className="flex items-center gap-2">
                          <Bookmark className="h-4 w-4" />
                          Saves
                        </div>
                      </SelectItem>
                      <SelectItem value="views">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Views
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package">Package *</Label>
                  <Select value={selectedPackage} onValueChange={setSelectedPackage} disabled={!serviceType}>
                    <SelectTrigger id="package" className="h-12">
                      <SelectValue placeholder={serviceType ? "Select package" : "Select service type first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getPackages().map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="social-link">
                    {socialMedia ? `${socialMedia} Post/Profile Link` : "Social Media Post/Profile Link"} *
                  </Label>
                  <Input
                    id="social-link"
                    type="url"
                    placeholder={socialMedia ? `https://${socialMedia.toLowerCase()}.com/...` : "https://..."}
                    value={socialLink}
                    onChange={(e) => setSocialLink(e.target.value)}
                    required
                  />
                </div>

                {selectedPackage && (
                  <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total Price:</span>
                      <span className="text-2xl font-bold text-primary">GHS {getSelectedPrice()}</span>
                    </div>
                  </div>
                )}

                {submitError && (
                  <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                    <p className="text-sm text-destructive">{submitError}</p>
                  </div>
                )}

                <div className={`flex flex-row gap-3 mt-6 ${user ? "justify-end" : ""}`}>
                  {!user && (
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => setCurrentStep(2)}
                    >
                      <ChevronLeft className="mr-2 h-5 w-5" />
                      Back
                    </Button>
                  )}
                  <Button type="submit" size="lg" className={user ? "w-full" : "flex-1"} disabled={!canSubmit || isSubmitting}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {isSubmitting ? "Processing..." : "Pay with Paystack"}
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground text-center mt-4">
                  By proceeding, you agree to our terms of service. Your payment is secure and encrypted.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
