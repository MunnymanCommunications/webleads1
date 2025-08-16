// Environment configuration for production APIs
export const config = {
  // API Keys - these should be set in your Vercel environment variables
  ipinfo: {
    token: process.env.IPINFO_TOKEN,
    baseUrl: "https://ipinfo.io",
  },
  peopleDataLabs: {
    apiKey: process.env.PEOPLE_DATA_LABS_API_KEY,
    baseUrl: "https://api.peopledatalabs.com/v5",
  },
  hunter: {
    apiKey: process.env.HUNTER_API_KEY,
    baseUrl: "https://api.hunter.io/v2",
  },
  apollo: {
    apiKey: process.env.APOLLO_API_KEY,
    baseUrl: "https://api.apollo.io/v1",
  },

  // Rate limiting
  rateLimits: {
    peopleDataLabs: 1000, // requests per month (starter tier)
    hunter: 100, // requests per month (free tier)
    apollo: 1000, // requests per month
  },

  // Validation
  validateConfig() {
    const missing = []
    if (!this.ipinfo.token) missing.push("IPINFO_TOKEN")
    if (!this.peopleDataLabs.apiKey) missing.push("PEOPLE_DATA_LABS_API_KEY")
    if (!this.hunter.apiKey) missing.push("HUNTER_API_KEY")
    if (!this.apollo.apiKey) missing.push("APOLLO_API_KEY")

    if (missing.length > 0) {
      console.warn(`[v0] Missing environment variables: ${missing.join(", ")}`)
      console.warn("[v0] Some enrichment features may not work properly")
    }

    return missing.length === 0
  },
}

// Validate configuration on startup
if (typeof window === "undefined") {
  config.validateConfig()
}
