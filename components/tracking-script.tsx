"use client"

import { useEffect } from "react"
import { visitorTracker } from "@/lib/visitor-tracking"

interface TrackingScriptProps {
  clientId: string
  apiKey: string
  enabled?: boolean
}

export function TrackingScript({ clientId, apiKey, enabled = true }: TrackingScriptProps) {
  useEffect(() => {
    if (enabled && clientId && apiKey) {
      visitorTracker.init(clientId, apiKey)
    }
  }, [clientId, apiKey, enabled])

  return null // This component doesn't render anything
}
