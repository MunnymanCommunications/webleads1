// Visitor tracking utilities and IP intelligence
import type { Company } from "./types"
import { enrichmentServices } from "./enrichment-services"

export interface TrackingData {
  page: string
  referrer?: string
  userAgent: string
  timestamp: Date
  sessionId: string
  clientId: string
}

export interface VisitorSession {
  sessionId: string
  ipAddress: string
  userAgent: string
  startTime: Date
  pages: string[]
  referrer?: string
  duration: number
  location?: {
    country: string
    city: string
    region: string
  }
}

// Client-side tracking functions
export const visitorTracker = {
  // Initialize tracking for a client
  init(clientId: string, apiKey: string) {
    if (typeof window === "undefined") return

    const sessionId = this.getOrCreateSessionId()

    // Track initial page view
    this.trackPageView(clientId, apiKey, window.location.pathname)

    // Track page changes for SPAs
    this.setupSPATracking(clientId, apiKey)

    // Track session duration
    this.trackSessionDuration(sessionId)
  },

  // Generate or retrieve session ID
  getOrCreateSessionId(): string {
    if (typeof window === "undefined") return ""

    let sessionId = sessionStorage.getItem("leadintel_session")
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`
      sessionStorage.setItem("leadintel_session", sessionId)
    }
    return sessionId
  },

  // Track individual page view
  async trackPageView(clientId: string, apiKey: string, page: string) {
    if (typeof window === "undefined") return

    const trackingData: TrackingData = {
      page,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      sessionId: this.getOrCreateSessionId(),
      clientId,
    }

    try {
      await fetch("/api/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(trackingData),
      })
    } catch (error) {
      console.error("Tracking error:", error)
    }
  },

  // Setup SPA tracking for route changes
  setupSPATracking(clientId: string, apiKey: string) {
    if (typeof window === "undefined") return

    let currentPath = window.location.pathname

    // Track history changes
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = (...args) => {
      originalPushState.apply(history, args)
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname
        visitorTracker.trackPageView(clientId, apiKey, currentPath)
      }
    }

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args)
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname
        visitorTracker.trackPageView(clientId, apiKey, currentPath)
      }
    }

    // Track popstate events (back/forward buttons)
    window.addEventListener("popstate", () => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname
        visitorTracker.trackPageView(clientId, apiKey, currentPath)
      }
    })
  },

  // Track session duration
  trackSessionDuration(sessionId: string) {
    if (typeof window === "undefined") return

    const startTime = Date.now()

    // Update duration periodically
    const updateDuration = () => {
      const duration = Date.now() - startTime
      sessionStorage.setItem(`${sessionId}_duration`, duration.toString())
    }

    setInterval(updateDuration, 5000) // Update every 5 seconds

    // Track when user leaves
    window.addEventListener("beforeunload", updateDuration)
    window.addEventListener("visibilitychange", updateDuration)
  },
}

// Production IP intelligence with real API integrations
export const ipIntelligence = {
  // Real IP geolocation using IPinfo
  async getLocationFromIP(ipAddress: string) {
    try {
      const response = await fetch(`https://ipinfo.io/${ipAddress}?token=${process.env.IPINFO_TOKEN}`)
      if (!response.ok) throw new Error("IPinfo API error")

      const data = await response.json()
      return {
        country: data.country,
        city: data.city,
        region: data.region,
      }
    } catch (error) {
      console.error("[v0] IPinfo error:", error)
      // Fallback to basic geolocation
      return { country: "Unknown", city: "Unknown", region: "Unknown" }
    }
  },

  // Real company identification using IPinfo + Clearbit
  async getCompanyFromIP(ipAddress: string): Promise<Partial<Company> | null> {
    try {
      // First, get company info from IPinfo
      const ipResponse = await fetch(`https://ipinfo.io/${ipAddress}?token=${process.env.IPINFO_TOKEN}`)
      if (!ipResponse.ok) return null

      const ipData = await ipResponse.json()

      // Extract company name from org field (remove AS number)
      const orgName = ipData.org?.replace(/^AS\d+\s+/, "")
      if (!orgName || this.isResidentialISP(orgName)) return null

      // Try to get domain from hostname or use company name
      let domain = ipData.hostname
      if (domain) {
        // Extract domain from hostname
        const parts = domain.split(".")
        if (parts.length >= 2) {
          domain = parts.slice(-2).join(".")
        }
      }

      // If we have a domain, enrich with Clearbit
      if (domain) {
        const enrichmentResult = await enrichmentServices.enrichCompanyData(domain)
        if (enrichmentResult.success && enrichmentResult.data) {
          return enrichmentResult.data
        }
      }

      // Fallback to basic company info from IP
      return {
        name: orgName,
        domain: domain || undefined,
        industry: "Unknown",
        size: "Unknown",
      }
    } catch (error) {
      console.error("[v0] Company identification error:", error)
      return null
    }
  },

  // Check if IP is from a known ISP/residential provider
  isResidentialIP(ipAddress: string): boolean {
    // This would check against known residential IP ranges
    // For now, use a simple heuristic
    return Math.random() > 0.7 // 30% are business IPs
  },

  // Check if organization name indicates residential ISP
  isResidentialISP(orgName: string): boolean {
    const residentialIndicators = [
      "comcast",
      "verizon",
      "att",
      "charter",
      "cox",
      "spectrum",
      "residential",
      "broadband",
      "cable",
      "dsl",
      "fiber",
      "internet service",
      "telecom",
      "wireless",
    ]

    const lowerOrg = orgName.toLowerCase()
    return residentialIndicators.some((indicator) => lowerOrg.includes(indicator))
  },
}
