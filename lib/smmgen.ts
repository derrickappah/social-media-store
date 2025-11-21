/**
 * SMMGen API Integration
 * Handles order processing through SMMGen API
 * 
 * API Documentation: https://smmgen.com/api/v2
 * API uses form-encoded POST requests with numeric service IDs
 */

interface SMMGenOrder {
  service: number // Service ID from SMMGen (numeric)
  link: string // Social media link
  quantity: number // Amount to order
  runs?: number // Number of runs (optional)
  interval?: number // Interval between runs in minutes (optional)
  comments?: string // Custom comments (optional, for comment services)
  usernames?: string // Usernames for mentions (optional)
  hashtags?: string // Hashtags for mentions (optional)
  hashtag?: string // Single hashtag for mentions (optional)
  username?: string // Username for mentions (optional)
  media?: string // Media URL for mentions (optional)
  country?: string // Country code for traffic (optional)
  device?: string // Device type: Desktop/Mobile (optional)
  type_of_traffic?: number // Traffic type (optional)
  google_keyword?: string // Google keyword for traffic (optional)
  answer_number?: string // Answer number for polls (optional)
  groups?: string // Groups for invites (optional)
}

interface SMMGenResponse {
  order: number // Order ID from SMMGen
  status?: string
  error?: string
  message?: string
}

/**
 * Map our service types and platforms to SMMGen numeric service IDs
 * 
 * DEPRECATED: This function is kept for backward compatibility.
 * For new orders, use getSMMGenServiceIdFromPackage() from lib/pricing.ts
 * which allows different packages to have different SMMGen service IDs.
 * 
 * IMPORTANT: You MUST update these with your actual SMMGen service IDs!
 * Get your service IDs by calling the services() API endpoint
 * 
 * Example service IDs (these are examples - use your actual IDs):
 * - Instagram Likes: 1
 * - Instagram Followers: 2
 * - TikTok Followers: 10
 * - YouTube Views: 20
 */
export function getSMMGenServiceId(platform: string, serviceType: string): number | null {
  // TODO: Update these mappings with your actual SMMGen service IDs
  // You can get service IDs by calling: GET services API endpoint
  
  const serviceMap: Record<string, Record<string, number>> = {
    Instagram: {
      Likes: 1,        // ← Update with your actual service ID
      Followers: 2,    // ← Update with your actual service ID
      Comments: 3,     // ← Update with your actual service ID
      Saves: 4,        // ← Update with your actual service ID
      Views: 5,        // ← Update with your actual service ID
    },
    TikTok: {
      Likes: 9396,       // ← Update with your actual service ID
      Followers: 11,   // ← Update with your actual service ID
      Views: 12,       // ← Update with your actual service ID
    },
    Facebook: {
      Likes: 20,       // ← Update with your actual service ID
      Followers: 21,   // ← Update with your actual service ID
    },
    YouTube: {
      Views: 30,       // ← Update with your actual service ID
      Subscribers: 31, // ← Update with your actual service ID
    },
    Twitter: {
      Followers: 40,   // ← Update with your actual service ID
      Likes: 41,       // ← Update with your actual service ID
      Retweets: 42,    // ← Update with your actual service ID
    },
  }

  return serviceMap[platform]?.[serviceType] || null
}

/**
 * Process order through SMMGen API
 * Uses form-encoded POST request as per SMMGen API documentation
 */
export async function processSMMGenOrder(orderData: SMMGenOrder): Promise<SMMGenResponse> {
  const apiKey = process.env.SMMGEN_API_KEY
  // Correct API URL: https://smmgen.com/api/v2 (NOT api.smmgen.com)
  const apiUrl = process.env.SMMGEN_API_URL || "https://smmgen.com/api/v2"

  if (!apiKey) {
    throw new Error("SMMGEN_API_KEY environment variable is not set")
  }

  try {
    // Build form-encoded data as per SMMGen API spec
    const formData = new URLSearchParams()
    formData.append("key", apiKey)
    formData.append("action", "add")
    formData.append("service", orderData.service.toString())
    formData.append("link", orderData.link)
    formData.append("quantity", orderData.quantity.toString())

    // Add optional parameters if provided
    if (orderData.runs !== undefined) {
      formData.append("runs", orderData.runs.toString())
    }
    if (orderData.interval !== undefined) {
      formData.append("interval", orderData.interval.toString())
    }
    if (orderData.comments) {
      formData.append("comments", orderData.comments)
    }
    if (orderData.usernames) {
      formData.append("usernames", orderData.usernames)
    }
    if (orderData.hashtags) {
      formData.append("hashtags", orderData.hashtags)
    }
    if (orderData.hashtag) {
      formData.append("hashtag", orderData.hashtag)
    }
    if (orderData.username) {
      formData.append("username", orderData.username)
    }
    if (orderData.media) {
      formData.append("media", orderData.media)
    }
    if (orderData.country) {
      formData.append("country", orderData.country)
    }
    if (orderData.device) {
      formData.append("device", orderData.device)
    }
    if (orderData.type_of_traffic !== undefined) {
      formData.append("type_of_traffic", orderData.type_of_traffic.toString())
    }
    if (orderData.google_keyword) {
      formData.append("google_keyword", orderData.google_keyword)
    }
    if (orderData.answer_number) {
      formData.append("answer_number", orderData.answer_number)
    }
    if (orderData.groups) {
      formData.append("groups", orderData.groups)
    }

    console.log("[SMMGen] Sending order request:", {
      url: apiUrl,
      service: orderData.service,
      link: orderData.link,
      quantity: orderData.quantity,
    })

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)",
      },
      body: formData.toString(),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[SMMGen] API error:", response.status, errorText)
      throw new Error(`SMMGen API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[SMMGen] API response:", data)

    // Handle SMMGen API response format
    if (data.error) {
      throw new Error(`SMMGen API error: ${data.error}`)
    }

    return data
  } catch (error: any) {
    console.error("[SMMGen] Order processing error:", error)
    
    // Provide more specific error messages
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      throw new Error("Request to SMMGen API timed out. Please check your internet connection.")
    }
    
    if (error.message?.includes("fetch failed") || error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      throw new Error(`Cannot connect to SMMGen API at ${apiUrl}. Please check your internet connection and API URL.`)
    }
    
    throw error
  }
}

/**
 * Get SMMGen services list
 * Use this to get actual service IDs for your account
 */
export async function getSMMGenServices(): Promise<any> {
  const apiKey = process.env.SMMGEN_API_KEY
  const apiUrl = process.env.SMMGEN_API_URL || "https://smmgen.com/api/v2"

  if (!apiKey) {
    throw new Error("SMMGEN_API_KEY environment variable is not set")
  }

  const formData = new URLSearchParams()
  formData.append("key", apiKey)
  formData.append("action", "services")

  try {
    console.log("[SMMGen] Fetching services from:", apiUrl)
    console.log("[SMMGen] API Key present:", !!apiKey)

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)",
      },
      body: formData.toString(),
      // Add timeout and better error handling
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[SMMGen] Services API error:", response.status, errorText)
      throw new Error(`Failed to fetch services: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[SMMGen] Services fetched successfully")
    return data
  } catch (error: any) {
    console.error("[SMMGen] Services fetch error:", error)
    
    // Provide more specific error messages
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      throw new Error("Request to SMMGen API timed out. Please check your internet connection and try again.")
    }
    
    if (error.message?.includes("fetch failed") || error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      throw new Error(`Cannot connect to SMMGen API at ${apiUrl}. Please check:\n1. Your internet connection\n2. The API URL is correct\n3. SMMGen service is accessible`)
    }
    
    throw error
  }
}

/**
 * Get SMMGen account balance
 */
export async function getSMMGenBalance(): Promise<any> {
  const apiKey = process.env.SMMGEN_API_KEY
  const apiUrl = process.env.SMMGEN_API_URL || "https://smmgen.com/api/v2"

  if (!apiKey) {
    throw new Error("SMMGEN_API_KEY environment variable is not set")
  }

  const formData = new URLSearchParams()
  formData.append("key", apiKey)
  formData.append("action", "balance")

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)",
      },
      body: formData.toString(),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch balance: ${response.status} - ${errorText}`)
    }

    return await response.json()
  } catch (error: any) {
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      throw new Error("Request to SMMGen API timed out.")
    }
    throw error
  }
}

/**
 * Get order status from SMMGen
 */
export async function getSMMGenOrderStatus(orderId: number): Promise<any> {
  const apiKey = process.env.SMMGEN_API_KEY
  const apiUrl = process.env.SMMGEN_API_URL || "https://smmgen.com/api/v2"

  if (!apiKey) {
    throw new Error("SMMGEN_API_KEY environment variable is not set")
  }

  const formData = new URLSearchParams()
  formData.append("key", apiKey)
  formData.append("action", "status")
  formData.append("order", orderId.toString())

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)",
      },
      body: formData.toString(),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch order status: ${response.status} - ${errorText}`)
    }

    return await response.json()
  } catch (error: any) {
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      throw new Error("Request to SMMGen API timed out.")
    }
    throw error
  }
}

