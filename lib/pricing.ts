/**
 * Pricing and Markup Configuration
 * Maps customer prices to SMM panel costs
 */

interface PricingConfig {
  // Customer price in GHS
  customerPrice: number
  // SMM panel cost (in panel's currency, typically USD)
  panelCost: number
  // Currency of panel cost
  panelCurrency?: string
  // SMMGen service ID for this specific package
  smmgenServiceId: number
}

interface ServicePricing {
  [platform: string]: {
    [serviceType: string]: {
      [packageId: string]: PricingConfig
    }
  }
}

/**
 * Pricing configuration mapping
 * Update these with your actual pricing structure
 * 
 * Format: Platform -> Service Type -> Package ID -> { customerPrice, panelCost }
 */
export const PRICING_CONFIG: ServicePricing = {
  Instagram: {
    Likes: {
      likes_1k: {
        customerPrice: 10, // GHS 10 (what you charge)
        panelCost: 0.1,    // USD 0.1 (what panel charges)
        panelCurrency: "USD",
        smmgenServiceId: 1, // ← Update with your actual SMMGen service ID for this package
      },
      likes_5k: {
        customerPrice: 45,
        panelCost: 0.4,
        panelCurrency: "USD",
        smmgenServiceId: 2, // ← Different service ID for 5k package
      },
      likes_10k: {
        customerPrice: 80,
        panelCost: 0.7,
        panelCurrency: "USD",
        smmgenServiceId: 3, // ← Different service ID for 10k package
      },
    },
    Followers: {
      followers_500: {
        customerPrice: 15,
        panelCost: 0.15,
        panelCurrency: "USD",
        smmgenServiceId: 4, // ← Update with your actual SMMGen service ID
      },
      followers_1k: {
        customerPrice: 25,
        panelCost: 0.25,
        panelCurrency: "USD",
        smmgenServiceId: 5, // ← Different service ID
      },
      followers_5k: {
        customerPrice: 100,
        panelCost: 1.0,
        panelCurrency: "USD",
        smmgenServiceId: 6, // ← Different service ID
      },
    },
    Comments: {
      comments_50: {
        customerPrice: 10,
        panelCost: 0.1,
        panelCurrency: "USD",
        smmgenServiceId: 7, // ← Update with your actual SMMGen service ID
      },
      comments_100: {
        customerPrice: 18,
        panelCost: 0.15,
        panelCurrency: "USD",
        smmgenServiceId: 8, // ← Different service ID
      },
    },
    Saves: {
      saves_500: {
        customerPrice: 12,
        panelCost: 0.12,
        panelCurrency: "USD",
        smmgenServiceId: 9, // ← Update with your actual SMMGen service ID
      },
      saves_1k: {
        customerPrice: 20,
        panelCost: 0.18,
        panelCurrency: "USD",
        smmgenServiceId: 10, // ← Different service ID
      },
      saves_5k: {
        customerPrice: 90,
        panelCost: 0.8,
        panelCurrency: "USD",
        smmgenServiceId: 11, // ← Different service ID
      },
    },
    Views: {
      views_1k: {
        customerPrice: 8,
        panelCost: 0.08,
        panelCurrency: "USD",
        smmgenServiceId: 12, // ← Update with your actual SMMGen service ID
      },
      views_5k: {
        customerPrice: 35,
        panelCost: 0.3,
        panelCurrency: "USD",
        smmgenServiceId: 13, // ← Different service ID
      },
      views_10k: {
        customerPrice: 65,
        panelCost: 0.55,
        panelCurrency: "USD",
        smmgenServiceId: 14, // ← Different service ID
      },
    },
  },
  TikTok: {
    Likes: {
      likes_1k: {
        customerPrice: 10,
        panelCost: 0.1,
        panelCurrency: "USD",
        smmgenServiceId: 9396, // ← Update with your actual SMMGen service ID
      },
      likes_5k: {
        customerPrice: 45,
        panelCost: 0.4,
        panelCurrency: "USD",
        smmgenServiceId: 9397, // ← Different service ID for 5k package
      },
      likes_10k: {
        customerPrice: 80,
        panelCost: 0.7,
        panelCurrency: "USD",
        smmgenServiceId: 9398, // ← Different service ID for 10k package
      },
    },
    Followers: {
      followers_500: {
        customerPrice: 15,
        panelCost: 0.15,
        panelCurrency: "USD",
        smmgenServiceId: 15, // ← Update with your actual SMMGen service ID
      },
      followers_1k: {
        customerPrice: 25,
        panelCost: 0.25,
        panelCurrency: "USD",
        smmgenServiceId: 16, // ← Different service ID
      },
      followers_5k: {
        customerPrice: 100,
        panelCost: 1.0,
        panelCurrency: "USD",
        smmgenServiceId: 17, // ← Different service ID
      },
    },
    Views: {
      views_1k: {
        customerPrice: 8,
        panelCost: 0.08,
        panelCurrency: "USD",
        smmgenServiceId: 18, // ← Update with your actual SMMGen service ID
      },
      views_5k: {
        customerPrice: 35,
        panelCost: 0.3,
        panelCurrency: "USD",
        smmgenServiceId: 19, // ← Different service ID
      },
      views_10k: {
        customerPrice: 65,
        panelCost: 0.55,
        panelCurrency: "USD",
        smmgenServiceId: 20, // ← Different service ID
      },
    },
  },
  Facebook: {
    Likes: {
      likes_1k: {
        customerPrice: 10,
        panelCost: 0.1,
        panelCurrency: "USD",
        smmgenServiceId: 21, // ← Update with your actual SMMGen service ID
      },
    },
    Followers: {
      followers_500: {
        customerPrice: 15,
        panelCost: 0.15,
        panelCurrency: "USD",
        smmgenServiceId: 22, // ← Update with your actual SMMGen service ID
      },
    },
  },
  YouTube: {
    Views: {
      views_1k: {
        customerPrice: 8,
        panelCost: 0.08,
        panelCurrency: "USD",
        smmgenServiceId: 23, // ← Update with your actual SMMGen service ID
      },
      views_5k: {
        customerPrice: 35,
        panelCost: 0.3,
        panelCurrency: "USD",
        smmgenServiceId: 24, // ← Different service ID
      },
      views_10k: {
        customerPrice: 65,
        panelCost: 0.55,
        panelCurrency: "USD",
        smmgenServiceId: 25, // ← Different service ID
      },
    },
  },
  Twitter: {
    Followers: {
      followers_500: {
        customerPrice: 15,
        panelCost: 0.15,
        panelCurrency: "USD",
        smmgenServiceId: 26, // ← Update with your actual SMMGen service ID
      },
      followers_1k: {
        customerPrice: 25,
        panelCost: 0.25,
        panelCurrency: "USD",
        smmgenServiceId: 27, // ← Different service ID
      },
    },
  },
}

/**
 * Get pricing configuration for a specific package
 */
export function getPricingConfig(
  platform: string,
  serviceType: string,
  packageId: string
): PricingConfig | null {
  return PRICING_CONFIG[platform]?.[serviceType]?.[packageId] || null
}

/**
 * Get SMMGen service ID for a specific package
 * This allows different packages to use different SMMGen service IDs
 */
export function getSMMGenServiceIdFromPackage(
  platform: string,
  serviceType: string,
  packageId: string
): number | null {
  const config = getPricingConfig(platform, serviceType, packageId)
  return config?.smmgenServiceId || null
}

/**
 * Calculate profit margin for an order
 */
export function calculateProfit(
  platform: string,
  serviceType: string,
  packageId: string,
  exchangeRate?: number // GHS to panel currency (e.g., GHS to USD)
): {
  customerPrice: number
  panelCost: number
  panelCostInGHS: number
  profit: number
  profitMargin: number
} | null {
  const config = getPricingConfig(platform, serviceType, packageId)
  
  if (!config) {
    return null
  }

  // Default exchange rate: 1 USD = 12 GHS (update this with current rate)
  const defaultExchangeRate = exchangeRate || 12
  const panelCostInGHS = config.panelCost * defaultExchangeRate
  const profit = config.customerPrice - panelCostInGHS
  const profitMargin = (profit / config.customerPrice) * 100

  return {
    customerPrice: config.customerPrice,
    panelCost: config.panelCost,
    panelCostInGHS: panelCostInGHS,
    profit: profit,
    profitMargin: profitMargin,
  }
}

/**
 * Get panel cost for an order
 * This is what you'll actually pay to the SMM panel
 */
export function getPanelCost(
  platform: string,
  serviceType: string,
  packageId: string
): number | null {
  const config = getPricingConfig(platform, serviceType, packageId)
  return config?.panelCost || null
}

