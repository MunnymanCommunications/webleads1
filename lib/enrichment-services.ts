// Production-ready company and contact enrichment services
import type { Company, Contact } from "./types"

export interface EnrichmentResult {
  success: boolean
  data?: Partial<Company>
  contacts?: Partial<Contact>[]
  error?: string
  source: string
}

export interface ContactEnrichmentResult {
  success: boolean
  contacts: Partial<Contact>[]
  source: string
  error?: string
}

// Real API integrations for production use
export const enrichmentServices = {
  // IPinfo for IP geolocation and company identification
  async getCompanyFromIP(ipAddress: string): Promise<{ company?: string; domain?: string; location?: any }> {
    try {
      const response = await fetch(`https://ipinfo.io/${ipAddress}?token=${process.env.IPINFO_TOKEN}`)
      if (!response.ok) throw new Error("IPinfo API error")

      const data = await response.json()
      return {
        company: data.org?.replace(/^AS\d+\s+/, ""), // Remove AS number prefix
        location: {
          country: data.country,
          region: data.region,
          city: data.city,
        },
      }
    } catch (error) {
      console.error("IPinfo error:", error)
      return {}
    }
  },

  // People Data Labs for company enrichment
  async enrichCompanyData(domain: string): Promise<EnrichmentResult> {
    try {
      const response = await fetch(`https://api.peopledatalabs.com/v5/company/enrich?website=${domain}`, {
        method: "GET",
        headers: {
          "X-Api-Key": process.env.PEOPLE_DATA_LABS_API_KEY || "",
        },
      })

      if (response.status === 404) {
        return { success: false, error: "Company not found", source: "peopledatalabs" }
      }

      if (!response.ok) {
        throw new Error(`People Data Labs API error: ${response.status}`)
      }

      const data = await response.json()

      return {
        success: true,
        data: {
          name: data.name,
          domain: data.website,
          industry: data.industry,
          size: this.formatEmployeeCount(data.employee_count),
          location: data.location ? `${data.location.locality}, ${data.location.region}` : undefined,
          description: data.summary,
          logo: data.logo_url,
          website: data.website,
        },
        source: "peopledatalabs",
      }
    } catch (error) {
      console.error("People Data Labs enrichment error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        source: "peopledatalabs",
      }
    }
  },

  // Hunter.io for email discovery
  async findEmailContacts(domain: string): Promise<ContactEnrichmentResult> {
    try {
      const response = await fetch(
        `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${process.env.HUNTER_API_KEY}&limit=10`,
      )

      if (!response.ok) {
        throw new Error(`Hunter.io API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.data?.emails) {
        return { success: true, contacts: [], source: "hunter" }
      }

      const contacts = data.data.emails
        .filter((email: any) => email.confidence > 50) // Only high-confidence emails
        .map((email: any) => ({
          firstName: email.first_name,
          lastName: email.last_name,
          email: email.value,
          title: email.position,
          source: "enrichment" as const,
          confidence: email.confidence,
        }))

      return {
        success: true,
        contacts,
        source: "hunter",
      }
    } catch (error) {
      console.error("Hunter.io error:", error)
      return {
        success: false,
        contacts: [],
        error: error instanceof Error ? error.message : "Unknown error",
        source: "hunter",
      }
    }
  },

  // Apollo for contact enrichment and prospecting
  async findDecisionMakers(companyName: string, domain: string): Promise<ContactEnrichmentResult> {
    try {
      const response = await fetch("https://api.apollo.io/v1/mixed_people/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "X-Api-Key": process.env.APOLLO_API_KEY || "",
        },
        body: JSON.stringify({
          q_organization_domains: [domain],
          person_titles: [
            "CEO",
            "President",
            "VP",
            "Vice President",
            "Director",
            "Head of",
            "Chief",
            "Manager",
            "Lead",
          ],
          page: 1,
          per_page: 10,
        }),
      })

      if (!response.ok) {
        throw new Error(`Apollo API error: ${response.status}`)
      }

      const data = await response.json()

      const contacts = (data.people || []).map((person: any) => ({
        firstName: person.first_name,
        lastName: person.last_name,
        email: person.email,
        title: person.title,
        linkedinUrl: person.linkedin_url,
        source: "enrichment" as const,
      }))

      return {
        success: true,
        contacts,
        source: "apollo",
      }
    } catch (error) {
      console.error("Apollo error:", error)
      return {
        success: false,
        contacts: [],
        error: error instanceof Error ? error.message : "Unknown error",
        source: "apollo",
      }
    }
  },

  // Contact enrichment with additional data
  async enrichContactData(email: string): Promise<Partial<Contact> | null> {
    try {
      // Try Apollo first for contact enrichment
      const response = await fetch("https://api.apollo.io/v1/people/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": process.env.APOLLO_API_KEY || "",
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) return null

      const data = await response.json()
      const person = data.person

      if (!person) return null

      return {
        phone: person.phone_numbers?.[0]?.sanitized_number,
        linkedinUrl: person.linkedin_url,
        title: person.title,
        // Add more enriched data as needed
      }
    } catch (error) {
      console.error("Contact enrichment error:", error)
      return null
    }
  },

  // Social media profile discovery using People Data Labs
  async findSocialProfiles(domain: string): Promise<{ [key: string]: string }> {
    const profiles: { [key: string]: string } = {}

    try {
      // Use People Data Labs for social profiles
      const response = await fetch(`https://api.peopledatalabs.com/v5/company/enrich?website=${domain}`, {
        method: "GET",
        headers: {
          "X-Api-Key": process.env.PEOPLE_DATA_LABS_API_KEY || "",
        },
      })

      if (response.ok) {
        const data = await response.json()

        if (data.linkedin_url) {
          profiles.linkedin = data.linkedin_url
        }
        if (data.twitter_url) {
          profiles.twitter = data.twitter_url
        }
        if (data.facebook_url) {
          profiles.facebook = data.facebook_url
        }
      }
    } catch (error) {
      console.error("Social profiles error:", error)
    }

    return profiles
  },

  // Helper function to format employee count
  formatEmployeeCount(count: number): string {
    if (!count) return "Unknown"
    if (count < 10) return "1-10"
    if (count < 50) return "11-50"
    if (count < 200) return "51-200"
    if (count < 1000) return "201-1000"
    if (count < 5000) return "1000-5000"
    return "5000+"
  },
}

// Production enrichment orchestrator with rate limiting and error handling
export const enrichmentOrchestrator = {
  async enrichCompany(
    companyId: string,
    domain: string,
  ): Promise<{
    companyData?: Partial<Company>
    contacts: Partial<Contact>[]
    socialProfiles?: { [key: string]: string }
  }> {
    console.log(`[v0] Starting enrichment for company: ${domain}`)

    // Run enrichment services in parallel with proper error handling
    const [companyResult, hunterResult, apolloResult, socialResult] = await Promise.allSettled([
      enrichmentServices.enrichCompanyData(domain),
      enrichmentServices.findEmailContacts(domain),
      enrichmentServices.findDecisionMakers("", domain),
      enrichmentServices.findSocialProfiles(domain),
    ])

    let companyData: Partial<Company> | undefined
    let contacts: Partial<Contact>[] = []
    let socialProfiles: { [key: string]: string } | undefined

    // Process company data
    if (companyResult.status === "fulfilled" && companyResult.value.success) {
      companyData = companyResult.value.data
      console.log(`[v0] Company data enriched successfully`)
    } else if (companyResult.status === "fulfilled") {
      console.log(`[v0] Company enrichment failed: ${companyResult.value.error}`)
    }

    // Process Hunter.io contacts
    if (hunterResult.status === "fulfilled" && hunterResult.value.success) {
      contacts = [...contacts, ...hunterResult.value.contacts]
      console.log(`[v0] Found ${hunterResult.value.contacts.length} contacts from Hunter.io`)
    }

    // Process Apollo contacts
    if (apolloResult.status === "fulfilled" && apolloResult.value.success) {
      contacts = [...contacts, ...apolloResult.value.contacts]
      console.log(`[v0] Found ${apolloResult.value.contacts.length} contacts from Apollo`)
    }

    // Process social profiles
    if (socialResult.status === "fulfilled") {
      socialProfiles = socialResult.value
      console.log(`[v0] Found ${Object.keys(socialResult.value).length} social profiles`)
    }

    // Deduplicate contacts by email
    const uniqueContacts = contacts.filter(
      (contact, index, self) => contact.email && index === self.findIndex((c) => c.email === contact.email),
    )

    console.log(`[v0] Enrichment complete. Total unique contacts: ${uniqueContacts.length}`)

    return {
      companyData,
      contacts: uniqueContacts,
      socialProfiles,
    }
  },

  async batchEnrichCompanies(companyIds: string[], domain: string[]): Promise<void> {
    console.log(`[v0] Starting batch enrichment for ${companyIds.length} companies`)

    // Process companies in smaller batches to respect API rate limits
    const batchSize = 2 // Reduced batch size for API limits

    for (let i = 0; i < companyIds.length; i += batchSize) {
      const batch = companyIds.slice(i, i + batchSize)
      const domainBatch = domain.slice(i, i + batchSize)

      console.log(`[v0] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(companyIds.length / batchSize)}`)

      await Promise.all(batch.map((id, index) => this.enrichCompany(id, domainBatch[index])))

      // Wait between batches to respect rate limits
      if (i + batchSize < companyIds.length) {
        console.log(`[v0] Waiting 3 seconds before next batch...`)
        await new Promise((resolve) => setTimeout(resolve, 3000))
      }
    }

    console.log(`[v0] Batch enrichment completed`)
  },
}
