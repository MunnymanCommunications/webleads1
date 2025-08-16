"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard-layout"
import { crmApi } from "@/lib/crm-api"
import type { Visit, Company } from "@/lib/types"
import { Eye, MapPin, Clock, Globe, Monitor, Smartphone } from "lucide-react"

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClient] = useState("client-1")

  useEffect(() => {
    loadVisits()
  }, [selectedClient])

  const loadVisits = async () => {
    try {
      const [visitsData, companiesData] = await Promise.all([
        crmApi.getVisits(selectedClient),
        crmApi.getCompanies(selectedClient),
      ])
      setVisits(visitsData)
      setCompanies(companiesData)
    } catch (error) {
      console.error("Failed to load visits:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCompanyForVisit = (visit: Visit) => {
    return companies.find((c) => c.id === visit.companyId)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Website Visits</h1>
          <p className="text-gray-600">Track and analyze all website visitor activity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visits.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Identified Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visits.filter((v) => v.companyId).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {visits.length > 0 ? Math.round(visits.reduce((acc, v) => acc + v.duration, 0) / visits.length) : 0}s
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Visits</CardTitle>
            <CardDescription>All website visitor activity</CardDescription>
          </CardHeader>
          <CardContent>
            {visits.length > 0 ? (
              <div className="space-y-4">
                {visits.map((visit) => {
                  const company = getCompanyForVisit(visit)
                  return (
                    <div key={visit.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{company ? company.name : `Unknown Visitor`}</h3>
                              {company && <Badge variant="secondary">{company.industry || "Unknown Industry"}</Badge>}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Globe className="h-4 w-4" />
                                {visit.ipAddress}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {visit.duration}s duration
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {visit.pages.length} pages
                              </div>
                              {visit.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {visit.location.city}, {visit.location.country}
                                </div>
                              )}
                            </div>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">Pages: {visit.pages.join(" → ")}</p>
                              {visit.referrer && <p className="text-sm text-gray-600">Referrer: {visit.referrer}</p>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{new Date(visit.timestamp).toLocaleString()}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {visit.userAgent?.includes("Mobile") ? (
                              <Smartphone className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Monitor className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No visits yet</h3>
                <p className="text-gray-600 mb-4">Install the tracking code to start monitoring website visitors</p>
                <Button>Get Tracking Code</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
