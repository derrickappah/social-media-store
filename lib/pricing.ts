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
      },
      likes_5k: {
        customerPrice: 45,
        panelCost: 0.4,
        panelCurrency: "USD",
      },
      likes_10k: {
        customerPrice: 80,
        panelCost: 0.7,
        panelCurrency: "USD",
      },
    },
    Followers: {
      followers_500: {
        customerPrice: 15,
        panelCost: 0.15,
        panelCurrency: "USD",
      },
      followers_1k: {
        customerPrice: 25,
        panelCost: 0.25,
        panelCurrency: "USD",
      },
      followers_5k: {
        customerPrice: 100,
        panelCost: 1.0,
        panelCurrency: "USD",
      },
    },
    Comments: {
      comments_50: {
        customerPrice: 10,
        panelCost: 0.1,
        panelCurrency: "USD",
      },
      comments_100: {
        customerPrice: 18,
        panelCost: 0.15,
        panelCurrency: "USD",
      },
    },
    Saves: {
      saves_500: {
        customerPrice: 12,
        panelCost: 0.12,
        panelCurrency: "USD",
      },
      saves_1k: {
        customerPrice: 20,
        panelCost: 0.18,
        panelCurrency: "USD",
      },
      saves_5k: {
        customerPrice: 90,
        panelCost: 0.8,
        panelCurrency: "USD",
      },
    },
    Views: {
      views_1k: {
        customerPrice: 8,
        panelCost: 0.08,
        panelCurrency: "USD",
      },
      views_5k: {
        customerPrice: 35,
        panelCost: 0.3,
        panelCurrency: "USD",
      },
      views_10k: {
        customerPrice: 65,
        panelCost: 0.55,
        panelCurrency: "USD",
      },
    },
  },
  TikTok: {
    Likes: {
      likes_1k: {
        customerPrice: 10,
        panelCost: 0.1,
        panelCurrency: "USD",
      },
      likes_5k: {
        customerPrice: 45,
        panelCost: 0.4,
        panelCurrency: "USD",
      },
      likes_10k: {
        customerPrice: 80,
        panelCost: 0.7,
        panelCurrency: "USD",
      },
    },
    Followers: {
      followers_500: {
        customerPrice: 15,
        panelCost: 0.15,
        panelCurrency: "USD",
      },
      followers_1k: {
        customerPrice: 25,
        panelCost: 0.25,
        panelCurrency: "USD",
      },
      followers_5k: {
        customerPrice: 100,
        panelCost: 1.0,
        panelCurrency: "USD",
      },
    },
    Views: {
      views_1k: {
        customerPrice: 8,
        panelCost: 0.08,
        panelCurrency: "USD",
      },
      views_5k: {
        customerPrice: 35,
        panelCost: 0.3,
        panelCurrency: "USD",
      },
      views_10k: {
        customerPrice: 65,
        panelCost: 0.55,
        panelCurrency: "USD",
      },
    },
  },
  Facebook: {
    Likes: {
      likes_1k: {
        customerPrice: 10,
        panelCost: 0.1,
        panelCurrency: "USD",
      },
    },
    Followers: {
      followers_500: {
        customerPrice: 15,
        panelCost: 0.15,
        panelCurrency: "USD",
      },
    },
  },
  YouTube: {
    Views: {
      views_1k: {
        customerPrice: 8,
        panelCost: 0.08,
        panelCurrency: "USD",
      },
      views_5k: {
        customerPrice: 35,
        panelCost: 0.3,
        panelCurrency: "USD",
      },
      views_10k: {
        customerPrice: 65,
        panelCost: 0.55,
        panelCurrency: "USD",
      },
    },
  },
  Twitter: {
    Followers: {
      followers_500: {
        customerPrice: 15,
        panelCost: 0.15,
        panelCurrency: "USD",
      },
      followers_1k: {
        customerPrice: 25,
        panelCost: 0.25,
        panelCurrency: "USD",
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

