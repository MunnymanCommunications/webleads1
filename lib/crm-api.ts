// Production CRM API functions - replace with real database operations
import type { Client, Company, Contact, Visit, FollowUp } from "./types"

// In production, these would be database operations
// For now, using in-memory storage that will be replaced
const productionData = {
  clients: [] as Client[],
  companies: [] as Company[],
  contacts: [] as Contact[],
  visits: [] as Visit[],
  followUps: [] as FollowUp[],
}

export const crmApi = {
  // Client operations
  async getClients(): Promise<Client[]> {
    // In production: SELECT * FROM clients
    return productionData.clients
  },

  async createClient(client: Omit<Client, "id" | "createdAt">): Promise<Client> {
    const newClient: Client = {
      ...client,
      id: `client-${Date.now()}`,
      createdAt: new Date(),
    }
    // In production: INSERT INTO clients
    productionData.clients.push(newClient)
    return newClient
  },

  async getClientByApiKey(apiKey: string): Promise<Client | null> {
    // In production: SELECT * FROM clients WHERE api_key = ?
    return productionData.clients.find((c) => c.apiKey === apiKey) || null
  },

  // Company operations
  async getCompanies(clientId: string): Promise<Company[]> {
    // In production: SELECT * FROM companies WHERE client_id = ?
    return productionData.companies.filter((c) => c.clientId === clientId)
  },

  async createCompany(company: Omit<Company, "id">): Promise<Company> {
    const newCompany: Company = {
      ...company,
      id: `company-${Date.now()}`,
    }
    // In production: INSERT INTO companies
    productionData.companies.push(newCompany)
    return newCompany
  },

  async updateCompany(companyId: string, updates: Partial<Company>): Promise<Company | null> {
    // In production: UPDATE companies SET ... WHERE id = ?
    const company = productionData.companies.find((c) => c.id === companyId)
    if (company) {
      Object.assign(company, updates, { updatedAt: new Date() })
      return company
    }
    return null
  },

  // Contact operations
  async getContacts(companyId: string): Promise<Contact[]> {
    // In production: SELECT * FROM contacts WHERE company_id = ?
    return productionData.contacts.filter((c) => c.companyId === companyId)
  },

  async createContact(contact: Omit<Contact, "id" | "createdAt">): Promise<Contact> {
    const newContact: Contact = {
      ...contact,
      id: `contact-${Date.now()}`,
      createdAt: new Date(),
    }
    // In production: INSERT INTO contacts
    productionData.contacts.push(newContact)
    return newContact
  },

  // Visit operations
  async getVisits(clientId: string, limit = 100): Promise<Visit[]> {
    // In production: SELECT * FROM visits WHERE client_id = ? ORDER BY timestamp DESC LIMIT ?
    return productionData.visits
      .filter((v) => v.clientId === clientId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  },

  async createVisit(visit: Omit<Visit, "id">): Promise<Visit> {
    const newVisit: Visit = {
      ...visit,
      id: `visit-${Date.now()}`,
    }
    // In production: INSERT INTO visits
    productionData.visits.push(newVisit)
    return newVisit
  },

  // Follow-up operations
  async getFollowUps(clientId: string): Promise<FollowUp[]> {
    // In production: SELECT * FROM follow_ups WHERE client_id = ?
    return productionData.followUps.filter((f) => f.clientId === clientId)
  },

  async createFollowUp(followUp: Omit<FollowUp, "id">): Promise<FollowUp> {
    const newFollowUp: FollowUp = {
      ...followUp,
      id: `followup-${Date.now()}`,
    }
    // In production: INSERT INTO follow_ups
    productionData.followUps.push(newFollowUp)
    return newFollowUp
  },

  async updateFollowUp(followUpId: string, updates: Partial<FollowUp>): Promise<FollowUp | null> {
    // In production: UPDATE follow_ups SET ... WHERE id = ?
    const followUp = productionData.followUps.find((f) => f.id === followUpId)
    if (followUp) {
      Object.assign(followUp, updates)
      return followUp
    }
    return null
  },

  // Analytics
  async getAnalytics(clientId: string): Promise<{
    totalVisits: number
    identifiedCompanies: number
    totalContacts: number
    recentVisits: Visit[]
  }> {
    const visits = await this.getVisits(clientId)
    const companies = await this.getCompanies(clientId)
    const allContacts = await Promise.all(companies.map((c) => this.getContacts(c.id)))
    const totalContacts = allContacts.flat().length

    return {
      totalVisits: visits.length,
      identifiedCompanies: visits.filter((v) => v.companyId).length,
      totalContacts,
      recentVisits: visits.slice(0, 10),
    }
  },
}
