import { type NextRequest, NextResponse } from "next/server"
import { enrichmentOrchestrator } from "@/lib/enrichment-services"

export async function POST(request: NextRequest) {
  try {
    const { companyIds, clientId } = await request.json()

    if (!companyIds || !Array.isArray(companyIds) || !clientId) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    // Start batch enrichment (runs in background)
    enrichmentOrchestrator.batchEnrichCompanies(companyIds).catch((error) => {
      console.error("Batch enrichment error:", error)
    })

    return NextResponse.json({
      success: true,
      message: `Started batch enrichment for ${companyIds.length} companies`,
      estimatedTime: `${Math.ceil(companyIds.length / 3) * 2} seconds`,
    })
  } catch (error) {
    console.error("Batch enrichment error:", error)
    return NextResponse.json({ error: "Batch enrichment failed" }, { status: 500 })
  }
}
