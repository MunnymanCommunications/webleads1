import { type NextRequest, NextResponse } from "next/server"
import { crmApi } from "@/lib/crm-api"
import { enrichmentOrchestrator } from "@/lib/enrichment-services"

export async function POST(request: NextRequest) {
  try {
    const { companyId, clientId } = await request.json()

    if (!companyId || !clientId) {
      return NextResponse.json({ error: "Missing companyId or clientId" }, { status: 400 })
    }

    // Get company data
    const companies = await crmApi.getCompanies(clientId)
    const company = companies.find((c) => c.id === companyId)

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Enrich company data
    const enrichmentResult = await enrichmentOrchestrator.enrichCompany(companyId, company.domain)

    // Update company with enriched data
    if (enrichmentResult.companyData) {
      // In a real implementation, this would update the database
      Object.assign(company, enrichmentResult.companyData, { enrichedAt: new Date() })
    }

    // Create contacts
    const createdContacts = []
    for (const contactData of enrichmentResult.contacts) {
      if (contactData.email && contactData.firstName && contactData.lastName) {
        const contact = await crmApi.createContact({
          firstName: contactData.firstName,
          lastName: contactData.lastName,
          email: contactData.email,
          title: contactData.title,
          companyId: company.id,
          source: "enrichment",
        })
        createdContacts.push(contact)
      }
    }

    return NextResponse.json({
      success: true,
      company,
      contacts: createdContacts,
      socialProfiles: enrichmentResult.socialProfiles,
    })
  } catch (error) {
    console.error("Enrichment error:", error)
    return NextResponse.json({ error: "Enrichment failed" }, { status: 500 })
  }
}
