"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check } from "lucide-react"

export function TrackingCodeGenerator() {
  const [copied, setCopied] = useState(false)
  const [clientName, setClientName] = useState("Client Name")

  const clientId = "client-1"
  const apiKey = "crm_live_1234567890abcdef"

  const trackingCode = `<!-- LeadIntel CRM Tracking Code -->
<script>
(function() {
  var script = document.createElement('script');
  script.src = 'https://YOUR_DEPLOYED_DOMAIN.com/tracking.js';
  script.async = true;
  script.onload = function() {
    if (window.LeadIntelTracker) {
      window.LeadIntelTracker.init('${clientId}', '${apiKey}', {
        endpoint: 'https://YOUR_DEPLOYED_DOMAIN.com',
        debug: true
      });
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
          <Label>Client Name</Label>
          <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Enter client name" />
        </div>

        <div className="space-y-2">
          <Label>Your Client ID</Label>
          <Input value={clientId} readOnly />
        </div>

        <div className="space-y-2">
          <Label>Your API Key</Label>
          <Input value={apiKey} readOnly type="password" />
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
          <Textarea value={trackingCode} readOnly rows={12} className="font-mono text-sm" />
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Installation Instructions:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Replace "YOUR_DEPLOYED_DOMAIN.com" with your actual CRM domain</li>
            <li>2. Copy the tracking code above</li>
            <li>3. Paste it before the closing &lt;/head&gt; tag on your website</li>
            <li>4. The tracker will automatically start identifying visitors</li>
            <li>5. View identified companies in your dashboard</li>
          </ol>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Important Setup:</h4>
          <p className="text-sm text-yellow-800">
            Make sure to replace "YOUR_DEPLOYED_DOMAIN.com" with your actual deployed CRM domain (e.g.,
            "crm.yourcompany.com") in both the script src and endpoint configuration for the tracking to work properly.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
