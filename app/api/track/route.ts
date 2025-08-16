import { type NextRequest, NextResponse } from "next/server"
import type { TrackingData } from "@/lib/visitor-tracking"
import { crmApi } from "@/lib/crm-api"
import { ipIntelligence } from "@/lib/visitor-tracking"

export async function POST(request: NextRequest) {
  try {
    const trackingData: TrackingData = await request.json()

    // Get client IP address with better header parsing
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const ipAddress = forwarded ? forwarded.split(",")[0].trim() : realIp || request.ip || "127.0.0.1"

    console.log(`[v0] Tracking visit from IP: ${ipAddress}`)

    // Validate API key
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    const apiKey = authHeader.replace("Bearer ", "")
    const client = await crmApi.getClientByApiKey(apiKey)
    if (!client) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    // Skip tracking for localhost/development IPs
    if (ipAddress === "127.0.0.1" || ipAddress === "::1" || ipAddress.startsWith("192.168.")) {
      return NextResponse.json({ success: true, message: "Development IP skipped" })
    }

    // Skip residential IPs
    if (ipIntelligence.isResidentialIP(ipAddress)) {
      console.log(`[v0] Skipping residential IP: ${ipAddress}`)
      return NextResponse.json({ success: true, message: "Residential IP skipped" })
    }

    // Get location data
    const location = await ipIntelligence.getLocationFromIP(ipAddress)
    console.log(`[v0] Location: ${location.city}, ${location.country}`)

    // Try to identify company
    let companyId: string | undefined
    const companyData = await ipIntelligence.getCompanyFromIP(ipAddress)

    if (companyData && companyData.name) {
      console.log(`[v0] Identified company: ${companyData.name}`)

      // Check if company already exists
      const existingCompanies = await crmApi.getCompanies(client.id)
      let existingCompany = existingCompanies.find(
        (c) => c.domain === companyData.domain || c.name === companyData.name,
      )

      if (!existingCompany) {
        // Create new company
        existingCompany = await crmApi.createCompany({
          name: companyData.name,
          domain: companyData.domain || "",
          industry: companyData.industry,
          size: companyData.size,
          description: companyData.description,
          clientId: client.id,
          createdAt: new Date(),
        })
        console.log(`[v0] Created new company: ${existingCompany.id}`)
      }

      companyId = existingCompany?.id
    }

    // Create visit record
    const visit = await crmApi.createVisit({
      ipAddress,
      userAgent: trackingData.userAgent,
      referrer: trackingData.referrer,
      pages: [trackingData.page],
      duration: 0, // Will be updated later
      timestamp: trackingData.timestamp,
      companyId,
      clientId: client.id,
      location,
    })

    console.log(`[v0] Created visit: ${visit.id}, Company identified: ${!!companyId}`)

    return NextResponse.json({
      success: true,
      visitId: visit.id,
      companyIdentified: !!companyId,
      companyName: companyData?.name,
    })
  } catch (error) {
    console.error("[v0] Tracking error:", error)
    return NextResponse.json({ error: "Tracking failed" }, { status: 500 })
  }
}
