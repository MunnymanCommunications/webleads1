"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check } from "lucide-react"
import { useAuth } from "./auth-provider"

export function TrackingCodeGenerator() {
  const { session } = useAuth()
  const [copied, setCopied] = useState(false)

  if (!session) return null

  const trackingCode = `<!-- LeadIntel CRM Tracking Code -->
<script>
(function() {
  var script = document.createElement('script');
  script.src = '${window.location.origin}/tracking.js';
  script.async = true;
  script.onload = function() {
    if (window.LeadIntelTracker) {
      window.LeadIntelTracker.init('${session.client.id}', '${session.client.apiKey}');
    }
  };
  document.head.appendChild(script);
})();
</script>`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(trackingCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Website Tracking Code</CardTitle>
        <CardDescription>
          Add this code to your website to start tracking visitors and identifying companies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Your Client ID</Label>
          <Input value={session.client.id} readOnly />
        </div>

        <div className="space-y-2">
          <Label>Your API Key</Label>
          <Input value={session.client.apiKey} readOnly type="password" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Tracking Code</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex items-center gap-2 bg-transparent"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <Textarea value={trackingCode} readOnly rows={10} className="font-mono text-sm" />
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Installation Instructions:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Copy the tracking code above</li>
            <li>2. Paste it before the closing &lt;/head&gt; tag on your website</li>
            <li>3. The tracker will automatically start identifying visitors</li>
            <li>4. View identified companies in your dashboard</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
