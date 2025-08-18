"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard-layout"
import { BatchEnrichment } from "@/components/batch-enrichment"
import { TrackingCodeGenerator } from "@/components/tracking-code-generator"
import { crmApi } from "@/lib/crm-api"
import type { Company, Visit, Contact } from "@/lib/types"
import { TrendingUp, Building2, Users, Eye, Clock, MapPin, ExternalLink, Sparkles, Calendar } from "lucide-react"

export default function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState("client-1") // Default client

  useEffect(() => {
    loadDashboardData()
  }, [selectedClient])

  const loadDashboardData = async () => {
    try {
      const [companiesData, visitsData] = await Promise.all([
        crmApi.getCompanies(selectedClient),
        crmApi.getVisits(selectedClient),
      ])

      setCompanies(companiesData)
      setVisits(visitsData)

      // Load contacts for all companies
      const allContacts = []
      for (const company of companiesData) {
        const companyContacts = await crmApi.getContacts(company.id)
        allContacts.push(...companyContacts)
      }
      setContacts(allContacts)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalVisits: visits.length,
    identifiedCompanies: companies.length,
    totalContacts: contacts.length,
    identificationRate: visits.length > 0 ? Math.round((companies.length / visits.length) * 100) : 0,
  }

  const recentVisits = visits
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  const recentCompanies = companies
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5)

  const handleScheduleFollowup = () => {
    window.location.href = "/dashboard/followups"
  }

  const handleAddContact = () => {
    window.location.href = "/dashboard/contacts"
  }

  const handleAddCompany = () => {
    window.location.href = "/dashboard/companies"
  }

  const handleViewTrackingCode = () => {
    window.location.href = "/dashboard/settings"
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Lead Intelligence CRM</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVisits}</div>
              <p className="text-xs text-muted-foreground">Website visitors tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies Identified</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.identifiedCompanies}</div>
              <p className="text-xs text-muted-foreground">From visitor tracking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacts Found</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalContacts}</div>
              <p className="text-xs text-muted-foreground">Decision makers discovered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Identification Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.identificationRate}%</div>
              <p className="text-xs text-muted-foreground">Visitors to companies</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Visits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Visits
                </CardTitle>
                <CardDescription>Latest website visitors and their activity</CardDescription>
              </CardHeader>
              <CardContent>
                {recentVisits.length > 0 ? (
                  <div className="space-y-4">
                    {recentVisits.map((visit) => {
                      const company = companies.find((c) => c.id === visit.companyId)
                      return (
                        <div key={visit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="font-medium">{company ? company.name : `Unknown (${visit.ipAddress})`}</p>
                              <p className="text-sm text-muted-foreground">
                                Viewed {visit.pages.length} page{visit.pages.length !== 1 ? "s" : ""} • {visit.duration}
                                s duration
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {new Date(visit.timestamp).toLocaleTimeString()}
                            </p>
                            {visit.location && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {visit.location.city}, {visit.location.country}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No visits yet. Install the tracking code to start identifying visitors.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Companies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Recently Identified Companies
                </CardTitle>
                <CardDescription>Companies discovered from visitor tracking</CardDescription>
              </CardHeader>
              <CardContent>
                {recentCompanies.length > 0 ? (
                  <div className="space-y-4">
                    {recentCompanies.map((company) => {
                      const companyContacts = contacts.filter((c) => c.companyId === company.id)
                      return (
                        <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Building2 className="h-8 w-8 text-blue-600" />
                            <div>
                              <p className="font-medium">{company.name}</p>
                              <p className="text-sm text-muted-foreground">{company.domain}</p>
                              <div className="flex gap-2 mt-1">
                                {company.industry && (
                                  <Badge variant="secondary" className="text-xs">
                                    {company.industry}
                                  </Badge>
                                )}
                                {company.size && (
                                  <Badge variant="outline" className="text-xs">
                                    {company.size}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{companyContacts.length} contacts</p>
                            <p className="text-xs text-muted-foreground">
                              {company.enrichedAt ? "Enriched" : "Not enriched"}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No companies identified yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline"
                  onClick={handleScheduleFollowup}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Follow-up
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline" onClick={handleAddContact}>
                  <Users className="mr-2 h-4 w-4" />
                  Add Contact
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline" onClick={handleAddCompany}>
                  <Building2 className="mr-2 h-4 w-4" />
                  Add Company
                </Button>
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline"
                  onClick={handleViewTrackingCode}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Tracking Code
                </Button>
              </CardContent>
            </Card>

            {/* Batch Enrichment */}
            <BatchEnrichment companies={companies} clientId={selectedClient} onComplete={loadDashboardData} />

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Client</p>
                  <p className="text-sm text-muted-foreground">Client Name</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Domain</p>
                  <p className="text-sm text-muted-foreground">Client Domain</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Setup Section */}
        {visits.length === 0 && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Get Started
              </CardTitle>
              <CardDescription>Install the tracking code to start identifying website visitors</CardDescription>
            </CardHeader>
            <CardContent>
              <TrackingCodeGenerator />
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
