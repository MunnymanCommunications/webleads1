"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CompanyEnrichment } from "@/components/company-enrichment"
import { useAuth } from "@/components/auth-provider"
import { crmApi } from "@/lib/crm-api"
import type { Company, Contact } from "@/lib/types"
import { Building2, Search, Users, Calendar } from "lucide-react"

export default function CompaniesPage() {
  const { session } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [contacts, setContacts] = useState<{ [companyId: string]: Contact[] }>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.client.id) {
      loadCompanies()
    }
  }, [session])

  const loadCompanies = async () => {
    if (!session?.client.id) return

    try {
      const companiesData = await crmApi.getCompanies(session.client.id)
      setCompanies(companiesData)

      // Load contacts for each company
      const contactsData: { [companyId: string]: Contact[] } = {}
      for (const company of companiesData) {
        const companyContacts = await crmApi.getContacts(company.id)
        contactsData[company.id] = companyContacts
      }
      setContacts(contactsData)
    } catch (error) {
      console.error("Failed to load companies:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleEnrichmentComplete = (updatedCompany: Company, newContacts: Contact[]) => {
    setCompanies((prev) => prev.map((c) => (c.id === updatedCompany.id ? updatedCompany : c)))
    setContacts((prev) => ({
      ...prev,
      [updatedCompany.id]: [...(prev[updatedCompany.id] || []), ...newContacts],
    }))
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
              <p className="text-gray-600">Manage identified companies and their contacts</p>
            </div>
            <Button>
              <Building2 className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search companies by name, domain, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{companies.length}</p>
                    <p className="text-sm text-muted-foreground">Total Companies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{Object.values(contacts).flat().length}</p>
                    <p className="text-sm text-muted-foreground">Total Contacts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{companies.filter((c) => c.enrichedAt).length}</p>
                    <p className="text-sm text-muted-foreground">Enriched Companies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Companies List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading companies...</div>
            ) : filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => (
                <CompanyEnrichment key={company.id} company={company} onEnrichmentComplete={handleEnrichmentComplete} />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm
                      ? "No companies match your search criteria."
                      : "Start tracking website visitors to identify companies."}
                  </p>
                  {!searchTerm && (
                    <Button>
                      <Building2 className="mr-2 h-4 w-4" />
                      Add Company Manually
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
