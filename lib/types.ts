// CRM System Types
export interface Client {
  id: string
  name: string
  domain: string
  apiKey: string
  createdAt: Date
  isActive: boolean
}

export interface Company {
  id: string
  name: string
  domain: string
  industry?: string
  size?: string
  location?: string
  description?: string
  enrichedAt?: Date
  clientId: string
}

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  title?: string
  phone?: string
  linkedinUrl?: string
  companyId: string
  source: "enrichment" | "manual" | "import"
  createdAt: Date
}

export interface Visit {
  id: string
  ipAddress: string
  userAgent: string
  referrer?: string
  pages: string[]
  duration: number
  timestamp: Date
  companyId?: string
  clientId: string
  location?: {
    country: string
    city: string
    region: string
  }
}

export interface FollowUp {
  id: string
  contactId: string
  type: "email" | "call" | "meeting" | "note"
  subject: string
  content: string
  status: "pending" | "completed" | "cancelled"
  scheduledAt: Date
  completedAt?: Date
  createdBy: string
  clientId: string
}

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  clientId: string
  createdAt: Date
}
