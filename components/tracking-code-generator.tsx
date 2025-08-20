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

  const clientId = "default-client"
  const apiKey = "default-api-key-123"

  const trackingCode = `<!-- LeadIntel CRM Tracking Code -->
<script>
(function() {
  var script = document.createElement('script');
  script.src = 'https://project1.harveyio.com/tracking.js';
  script.async = true;
  script.onload = function() {
    if (window.LeadIntelTracker) {
      window.LeadIntelTracker.init('${clientId}', '${apiKey}', {
        endpoint: 'https://project1.harveyio.com',
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
            <li>1. Copy the tracking code above (already configured for your domain)</li>
            <li>2. Paste it before the closing &lt;/head&gt; tag on your client's website</li>
            <li>3. The tracker will automatically start identifying visitors</li>
            <li>4. View identified companies in your dashboard</li>
            <li>5. Leads will be sent to your configured webhook URL</li>
          </ol>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-900 mb-2">✅ Ready to Deploy:</h4>
          <p className="text-sm text-green-800">
            This tracking code is pre-configured for your deployed CRM at project1.harveyio.com. Simply copy and paste
            it into any client website to start capturing leads immediately.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
