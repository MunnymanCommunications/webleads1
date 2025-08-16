"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CompanyEnrichment } from "@/components/company-enrichment"
import { BatchEnrichment } from "@/components/batch-enrichment"
import { crmApi } from "@/lib/crm-api"
import type { Company } from "@/lib/types"
import { Sparkles, Building2, CheckCircle, Clock } from "lucide-react"

export default function EnrichmentPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClient] = useState("client-1")

  useEffect(() => {
    loadCompanies()
  }, [selectedClient])

  const loadCompanies = async () => {
    try {
      const companiesData = await crmApi.getCompanies(selectedClient)
      setCompanies(companiesData)
    } catch (error) {
      console.error("Failed to load companies:", error)
    } finally {
      setLoading(false)
    }
  }

  const enrichedCompanies = companies.filter((c) => c.enrichedAt)
  const unenrichedCompanies = companies.filter((c) => !c.enrichedAt)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Enrichment</h1>
          <p className="text-gray-600">Enhance company profiles with contact information and business intelligence</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Enriched</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{enrichedCompanies.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{unenrichedCompanies.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies.length > 0 ? Math.round((enrichedCompanies.length / companies.length) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Company Enrichment Status</CardTitle>
                <CardDescription>Track enrichment progress for all identified companies</CardDescription>
              </CardHeader>
              <CardContent>
                {companies.length > 0 ? (
                  <div className="space-y-4">
                    {companies.map((company) => (
                      <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-8 w-8 text-blue-600" />
                          <div>
                            <h3 className="font-medium">{company.name}</h3>
                            <p className="text-sm text-gray-600">{company.domain}</p>
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
                        <div className="flex items-center gap-3">
                          {company.enrichedAt ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">Enriched</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-orange-600">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">Pending</span>
                            </div>
                          )}
                          <CompanyEnrichment company={company} onComplete={loadCompanies} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No companies to enrich</h3>
                    <p className="text-gray-600">Companies will appear here as visitors are identified</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <BatchEnrichment companies={unenrichedCompanies} clientId={selectedClient} onComplete={loadCompanies} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
