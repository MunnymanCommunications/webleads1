"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TrackingCodeGenerator } from "@/components/tracking-code-generator"
import { Settings, Key, Users, Building2, Download, RefreshCw, Copy, Check, Shield, Globe } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [copied, setCopied] = useState("")
  const [saving, setSaving] = useState(false)
  const [companyData, setCompanyData] = useState({
    name: "Your Company",
    domain: "yourcompany.com",
    industry: "",
    size: "",
    description: "",
  })

  const handleSaveCompanyInfo = async () => {
    setSaving(true)
    try {
      // Save to localStorage for now (replace with API call later)
      localStorage.setItem("companyData", JSON.stringify(companyData))
      console.log("[v0] Saving company info:", companyData)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      alert("Company information saved successfully!")
    } catch (error) {
      console.error("Failed to save:", error)
      alert("Failed to save company information")
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(""), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const regenerateApiKey = () => {
    // Mock API key regeneration
    console.log("[v0] Regenerating API key...")
    alert("API key regenerated successfully!")
  }

  const handleConnectIntegration = (integrationName: string) => {
    console.log(`[v0] Connecting ${integrationName} integration...`)
    alert(`${integrationName} integration connected! (Environment variables are already configured)`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account, team, and integrations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
                <CardDescription>Update your company details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companyData.name}
                      onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domain">Primary Domain</Label>
                    <Input
                      id="domain"
                      value={companyData.domain}
                      onChange={(e) => setCompanyData({ ...companyData, domain: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      placeholder="e.g., Technology, Healthcare"
                      value={companyData.industry}
                      onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Company Size</Label>
                    <Input
                      id="size"
                      placeholder="e.g., 1-10, 11-50, 51-200"
                      value={companyData.size}
                      onChange={(e) => setCompanyData({ ...companyData, size: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of your company"
                    value={companyData.description}
                    onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                  />
                </div>
                <Button onClick={handleSaveCompanyInfo} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Tracking Configuration
                </CardTitle>
                <CardDescription>Configure how visitor tracking works for your website</CardDescription>
              </CardHeader>
              <CardContent>
                <TrackingCodeGenerator />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Data Export
                </CardTitle>
                <CardDescription>Export your CRM data for backup or migration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="justify-start bg-transparent">
                    <Download className="mr-2 h-4 w-4" />
                    Export Companies
                  </Button>
                  <Button variant="outline" className="justify-start bg-transparent">
                    <Download className="mr-2 h-4 w-4" />
                    Export Contacts
                  </Button>
                  <Button variant="outline" className="justify-start bg-transparent">
                    <Download className="mr-2 h-4 w-4" />
                    Export Follow-ups
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Data will be exported in CSV format and sent to your email address.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
                <CardDescription>Manage your API keys for visitor tracking and integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Primary API Key</h4>
                      <p className="text-sm text-muted-foreground">Used for visitor tracking and data access</p>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                          crm_live_1234567890abcdef
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard("crm_live_1234567890abcdef", "apiKey")}
                        >
                          {copied === "apiKey" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={regenerateApiKey}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Keep your API keys secure. Regenerating a key will invalidate the previous one and may break
                    existing integrations.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="font-medium">API Usage</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-700">1,247</p>
                      <p className="text-sm text-blue-600">API Calls This Month</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-700">98.5%</p>
                      <p className="text-sm text-green-600">Success Rate</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-700">45ms</p>
                      <p className="text-sm text-purple-600">Avg Response Time</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Management */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Team Members
                    </CardTitle>
                    <CardDescription>Manage users who have access to your CRM</CardDescription>
                  </div>
                  <Button>
                    <Users className="mr-2 h-4 w-4" />
                    Invite User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current User */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">A</span>
                      </div>
                      <div>
                        <p className="font-medium">Admin User</p>
                        <p className="text-sm text-muted-foreground">admin@yourcompany.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Admin</Badge>
                      <Badge variant="secondary">You</Badge>
                    </div>
                  </div>

                  {/* Mock Team Members */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-700">JS</span>
                      </div>
                      <div>
                        <p className="font-medium">Jane Smith</p>
                        <p className="text-sm text-muted-foreground">jane@yourcompany.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">User</Badge>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-700">MD</span>
                      </div>
                      <div>
                        <p className="font-medium">Mike Davis</p>
                        <p className="text-sm text-muted-foreground">mike@yourcompany.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">User</Badge>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Role Permissions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Admin</span>
                      <span className="text-muted-foreground">Full access to all features and settings</span>
                    </div>
                    <div className="flex justify-between">
                      <span>User</span>
                      <span className="text-muted-foreground">Access to CRM data, cannot modify settings</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Available Integrations
                </CardTitle>
                <CardDescription>Connect external services to enhance your CRM capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Globe className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">IPinfo</h4>
                          <p className="text-sm text-muted-foreground">IP geolocation and company data</p>
                        </div>
                      </div>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={() => handleConnectIntegration("IPinfo")}
                    >
                      Test Connection
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">People Data Labs</h4>
                          <p className="text-sm text-muted-foreground">Company enrichment and employee data</p>
                        </div>
                      </div>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={() => handleConnectIntegration("People Data Labs")}
                    >
                      Test Connection
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Hunter.io</h4>
                          <p className="text-sm text-muted-foreground">Email finder and verification</p>
                        </div>
                      </div>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={() => handleConnectIntegration("Hunter.io")}
                    >
                      Test Connection
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Key className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Apollo</h4>
                          <p className="text-sm text-muted-foreground">Contact enrichment and prospecting</p>
                        </div>
                      </div>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={() => handleConnectIntegration("Apollo")}
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>

                <Alert className="mt-4">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    All integrations are configured via environment variables. The API keys you added during deployment
                    are being used automatically.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Manage your subscription and billing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">Professional Plan</h3>
                      <p className="text-blue-700">Perfect for growing businesses</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-900">$49</p>
                      <p className="text-sm text-blue-700">per month</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Up to 10,000 visitors/month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Unlimited companies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Advanced enrichment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Team collaboration</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Usage This Month</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 border rounded-lg">
                      <p className="text-2xl font-bold">2,847</p>
                      <p className="text-sm text-muted-foreground">Visitors Tracked</p>
                      <p className="text-xs text-green-600">28% of limit</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-2xl font-bold">156</p>
                      <p className="text-sm text-muted-foreground">Companies Identified</p>
                      <p className="text-xs text-muted-foreground">Unlimited</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-2xl font-bold">423</p>
                      <p className="text-sm text-muted-foreground">Contacts Enriched</p>
                      <p className="text-xs text-muted-foreground">Unlimited</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="bg-transparent">
                    Change Plan
                  </Button>
                  <Button variant="outline" className="bg-transparent">
                    Billing History
                  </Button>
                  <Button variant="outline" className="bg-transparent">
                    Update Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
