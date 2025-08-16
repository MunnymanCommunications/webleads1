"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Building2, Users, ExternalLink, Sparkles } from "lucide-react"
import type { Company, Contact } from "@/lib/types"

interface CompanyEnrichmentProps {
  company: Company
  onEnrichmentComplete?: (company: Company, contacts: Contact[]) => void
}

export function CompanyEnrichment({ company, onEnrichmentComplete }: CompanyEnrichmentProps) {
  const [loading, setLoading] = useState(false)
  const [enriched, setEnriched] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [socialProfiles, setSocialProfiles] = useState<{ [key: string]: string }>({})
  const [error, setError] = useState("")

  const handleEnrich = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/enrich/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: company.id,
          clientId: company.clientId,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setContacts(result.contacts || [])
        setSocialProfiles(result.socialProfiles || {})
        setEnriched(true)
        onEnrichmentComplete?.(result.company, result.contacts)
      } else {
        setError(result.error || "Enrichment failed")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <div>
              <CardTitle className="text-lg">{company.name}</CardTitle>
              <CardDescription>{company.domain}</CardDescription>
            </div>
          </div>
          <Button onClick={handleEnrich} disabled={loading} size="sm">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enriching...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Enrich Data
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Company Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Industry</p>
            <p className="text-sm">{company.industry || "Unknown"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Size</p>
            <p className="text-sm">{company.size || "Unknown"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Location</p>
            <p className="text-sm">{company.location || "Unknown"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Last Enriched</p>
            <p className="text-sm">
              {company.enrichedAt ? new Date(company.enrichedAt).toLocaleDateString() : "Never"}
            </p>
          </div>
        </div>

        {company.description && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
            <p className="text-sm text-gray-600">{company.description}</p>
          </div>
        )}

        {/* Social Profiles */}
        {Object.keys(socialProfiles).length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Social Profiles</p>
            <div className="flex gap-2">
              {Object.entries(socialProfiles).map(([platform, url]) => (
                <Badge key={platform} variant="outline" className="capitalize">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    {platform}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Contacts */}
        {contacts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4" />
              <p className="text-sm font-medium text-muted-foreground">Found Contacts ({contacts.length})</p>
            </div>
            <div className="space-y-2">
              {contacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{contact.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{contact.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {enriched && !error && (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>Company data enriched successfully! Found {contacts.length} contacts.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
