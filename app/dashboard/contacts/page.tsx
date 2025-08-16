"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/components/auth-provider"
import { crmApi } from "@/lib/crm-api"
import type { Contact, Company } from "@/lib/types"
import { Users, Search, Mail, Phone, Building2, Plus, ExternalLink } from "lucide-react"

export default function ContactsPage() {
  const { session } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.client.id) {
      loadContacts()
    }
  }, [session])

  const loadContacts = async () => {
    if (!session?.client.id) return

    try {
      const companiesData = await crmApi.getCompanies(session.client.id)
      setCompanies(companiesData)

      // Load contacts for all companies
      const allContacts = []
      for (const company of companiesData) {
        const companyContacts = await crmApi.getContacts(company.id)
        allContacts.push(...companyContacts)
      }
      setContacts(allContacts)
    } catch (error) {
      console.error("Failed to load contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCompanyName = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId)
    return company?.name || "Unknown Company"
  }

  const getCompanyDomain = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId)
    return company?.domain || ""
  }

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.title && contact.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      getCompanyName(contact.companyId).toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const contactsBySource = {
    enrichment: contacts.filter((c) => c.source === "enrichment").length,
    manual: contacts.filter((c) => c.source === "manual").length,
    import: contacts.filter((c) => c.source === "import").length,
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
              <p className="text-gray-600">Manage all your business contacts and decision makers</p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search contacts by name, email, title, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{contacts.length}</p>
                    <p className="text-sm text-muted-foreground">Total Contacts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{contactsBySource.enrichment}</p>
                    <p className="text-sm text-muted-foreground">Auto-Discovered</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{contactsBySource.manual}</p>
                    <p className="text-sm text-muted-foreground">Manually Added</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{contactsBySource.import}</p>
                    <p className="text-sm text-muted-foreground">Imported</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contacts List */}
          <Card>
            <CardHeader>
              <CardTitle>All Contacts</CardTitle>
              <CardDescription>
                {filteredContacts.length} of {contacts.length} contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading contacts...</div>
              ) : filteredContacts.length > 0 ? (
                <div className="space-y-4">
                  {filteredContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700">
                            {contact.firstName.charAt(0)}
                            {contact.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {contact.firstName} {contact.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{contact.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {getCompanyName(contact.companyId)} • {getCompanyDomain(contact.companyId)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{contact.phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge variant={contact.source === "enrichment" ? "default" : "outline"} className="text-xs">
                            {contact.source}
                          </Badge>
                          <Button variant="outline" size="sm" className="bg-transparent">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm
                      ? "No contacts match your search criteria."
                      : "Start enriching companies to discover contacts automatically."}
                  </p>
                  {!searchTerm && (
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Contact Manually
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
