"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2, Play, Search, RefreshCw } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const platforms = ["TikTok", "Instagram", "Facebook", "YouTube", "Twitter"]
const serviceTypes = ["Likes", "Followers", "Comments", "Saves", "Views"]

export default function TestSMMGenPage() {
  const [platform, setPlatform] = useState("TikTok")
  const [serviceType, setServiceType] = useState("Likes")
  const [link, setLink] = useState("https://tiktok.com/@test/video/123")
  const [quantity, setQuantity] = useState("1000")
  const [manualServiceId, setManualServiceId] = useState("")
  const [useManualServiceId, setUseManualServiceId] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [services, setServices] = useState<any>(null)
  const [loadingServices, setLoadingServices] = useState(false)
  const [servicesError, setServicesError] = useState<string | null>(null)

  const fetchServices = async () => {
    setLoadingServices(true)
    setServicesError(null)
    setServices(null)

    try {
      const response = await fetch("/api/smmgen/services")
      const data = await response.json()

      if (data.success && data.services) {
        setServices(data.services)
      } else {
        setServicesError(data.error || data.details || "Failed to fetch services")
      }
    } catch (error) {
      setServicesError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setLoadingServices(false)
    }
  }

  const handleTest = async () => {
    setLoading(true)
    setResult(null)

    try {
      const requestBody: any = {
        platform,
        serviceType,
        link,
        quantity: parseInt(quantity, 10),
      }

      // If manual service ID is provided, use it instead of mapping
      if (useManualServiceId && manualServiceId) {
        requestBody.serviceId = parseInt(manualServiceId, 10)
      }

      const response = await fetch("/api/smmgen/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: "Request failed",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container px-4 py-12 md:py-20">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Test SMMGen API</h1>
            <p className="text-muted-foreground">
              Test SMMGen order processing directly without going through payment flow
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Available SMMGen Services</span>
                <Button
                  onClick={fetchServices}
                  disabled={loadingServices}
                  variant="outline"
                  size="sm"
                >
                  {loadingServices ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Fetch Services
                    </>
                  )}
                </Button>
              </CardTitle>
              <CardDescription>
                Fetch your actual service IDs from SMMGen to find the correct service ID
              </CardDescription>
            </CardHeader>
            <CardContent>
              {servicesError && (
                <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-4">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    ❌ {servicesError}
                  </p>
                </div>
              )}

              {services && (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                      ✅ Found {Array.isArray(services) ? services.length : Object.keys(services).length} service(s)
                    </p>
                  </div>

                  <div className="max-h-96 overflow-auto">
                    {Array.isArray(services) ? (
                      <div className="space-y-2">
                        {services.map((service: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 bg-muted rounded border text-sm"
                          >
                            <div className="font-mono font-semibold">
                              ID: {service.service || service.id || idx + 1}
                            </div>
                            <div className="text-muted-foreground mt-1">
                              {service.name || service.service_name || JSON.stringify(service)}
                            </div>
                            {service.category && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Category: {service.category}
                              </div>
                            )}
                            {service.rate && (
                              <div className="text-xs text-muted-foreground">
                                Rate: {service.rate}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <pre className="bg-muted p-4 rounded text-xs overflow-auto">
                        {JSON.stringify(services, null, 2)}
                      </pre>
                    )}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      💡 <strong>Tip:</strong> Look for services matching your platform and service type.
                      Use the service ID (number) in the test below, or update <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">lib/smmgen.ts</code> with the correct mappings.
                    </p>
                  </div>
                </div>
              )}

              {!services && !loadingServices && !servicesError && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Click "Fetch Services" to load available services from SMMGen
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Order Configuration</CardTitle>
              <CardDescription>
                Fill in the details below to test SMMGen API integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform *</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger id="platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-type">Service Type *</Label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger id="service-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Social Media Link *</Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://tiktok.com/@user/video/123"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="1000"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                />
                <p className="text-sm text-muted-foreground">
                  Number of likes, followers, views, etc.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="use-manual-service-id"
                    checked={useManualServiceId}
                    onChange={(e) => setUseManualServiceId(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="use-manual-service-id" className="cursor-pointer">
                    Use manual service ID (override mapping)
                  </Label>
                </div>

                {useManualServiceId && (
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="manual-service-id">SMMGen Service ID *</Label>
                    <Input
                      id="manual-service-id"
                      type="number"
                      placeholder="Enter service ID from SMMGen"
                      value={manualServiceId}
                      onChange={(e) => setManualServiceId(e.target.value)}
                      min="1"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the exact service ID from SMMGen (found in the services list above)
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleTest}
                disabled={loading || !platform || !serviceType || !link || !quantity}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Test SMMGen API
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.success ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Test Successful
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      Test Failed
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.success ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        ✅ Order processed successfully through SMMGen!
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold">Test Data Sent:</h3>
                      <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                        {JSON.stringify(result.testData, null, 2)}
                      </pre>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold">SMMGen Response:</h3>
                      <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                        {JSON.stringify(result.smmgenResponse, null, 2)}
                      </pre>
                    </div>

                    {result.smmgenResponse?.orderId && (
                      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm">
                          <span className="font-medium">SMMGen Order ID:</span>{" "}
                          <span className="font-mono">{result.smmgenResponse.orderId}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Check your SMMGen panel to verify this order was created
                        </p>
                      </div>
                    )}

                    {result.nextSteps && (
                      <div className="space-y-2">
                        <h3 className="font-semibold">Next Steps:</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {result.nextSteps.map((step: string, idx: number) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        ❌ {result.error || "Test failed"}
                      </p>
                      {result.details && (
                        <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                          {result.details}
                        </p>
                      )}
                    </div>

                    {result.testData && (
                      <div className="space-y-2">
                        <h3 className="font-semibold">Test Data:</h3>
                        <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                          {JSON.stringify(result.testData, null, 2)}
                        </pre>
                      </div>
                    )}

                    {result.troubleshooting && (
                      <div className="space-y-2">
                        <h3 className="font-semibold">Troubleshooting:</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {result.troubleshooting.map((tip: string, idx: number) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold mb-2">Full Response:</h3>
                  <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-64">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

