"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Sparkles, Building2 } from "lucide-react"
import type { Company } from "@/lib/types"

interface BatchEnrichmentProps {
  companies: Company[]
  clientId: string
  onComplete?: () => void
}

export function BatchEnrichment({ companies, clientId, onComplete }: BatchEnrichmentProps) {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState("")
  const [error, setError] = useState("")

  const unenrichedCompanies = companies.filter((c) => !c.enrichedAt)

  const handleBatchEnrich = async () => {
    if (unenrichedCompanies.length === 0) return

    setLoading(true)
    setError("")
    setProgress(0)

    try {
      const companyIds = unenrichedCompanies.map((c) => c.id)

      const response = await fetch("/api/enrich/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyIds, clientId }),
      })

      const result = await response.json()

      if (result.success) {
        setEstimatedTime(result.estimatedTime)

        // Simulate progress updates
        const totalTime = Number.parseInt(result.estimatedTime) * 1000
        const interval = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev + 100 / (totalTime / 500)
            if (newProgress >= 100) {
              clearInterval(interval)
              setLoading(false)
              onComplete?.()
              return 100
            }
            return newProgress
          })
        }, 500)
      } else {
        setError(result.error || "Batch enrichment failed")
        setLoading(false)
      }
    } catch (err) {
      setError("Network error occurred")
      setLoading(false)
    }
  }

  if (unenrichedCompanies.length === 0) {
    return (
      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertDescription>All companies have been enriched!</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Batch Enrichment
        </CardTitle>
        <CardDescription>
          Enrich {unenrichedCompanies.length} companies with contact data and company information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Companies to enrich</p>
            <p className="text-2xl font-bold">{unenrichedCompanies.length}</p>
          </div>
          <Button onClick={handleBatchEnrich} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enriching...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Start Batch Enrichment
              </>
            )}
          </Button>
        </div>

        {loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            {estimatedTime && <p className="text-xs text-muted-foreground">Estimated time: {estimatedTime}</p>}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          <p>• Finds key decision makers and contact information</p>
          <p>• Enriches company data with industry and size information</p>
          <p>• Discovers social media profiles</p>
          <p>• Processes companies in batches to respect API limits</p>
        </div>
      </CardContent>
    </Card>
  )
}
