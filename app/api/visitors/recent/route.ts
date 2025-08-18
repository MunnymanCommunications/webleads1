import { NextResponse } from "next/server"
import { crmApi } from "@/lib/crm-api"

export async function GET() {
  try {
    console.log("[v0] Checking recent visits...")

    // Get all visits from the last 24 hours
    const visits = await crmApi.getRecentVisits(24)

    console.log(`[v0] Found ${visits.length} recent visits`)

    return NextResponse.json({
      success: true,
      visits: visits,
      count: visits.length,
    })
  } catch (error) {
    console.error("[v0] Error getting recent visits:", error)
    return NextResponse.json({ error: "Failed to get visits" }, { status: 500 })
  }
}
