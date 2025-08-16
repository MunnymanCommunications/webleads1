import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, TrendingUp, Mail } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">LeadIntel CRM</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Turn Website Visitors Into
            <span className="text-blue-600"> Qualified Leads</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Identify anonymous website visitors, enrich company data, and automatically generate qualified leads with
            our intelligent CRM system.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/dashboard">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">Watch Demo</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Visitor Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Identify companies visiting your website using advanced IP intelligence</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Building2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Company Enrichment</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatically enrich company profiles with industry, size, and contact data
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Contact Discovery</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Find key decision makers and their contact information automatically</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Mail className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Follow-up Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Organize and track all your lead follow-ups in one centralized system</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">85%</div>
              <div className="text-gray-600">Visitor Identification Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">3x</div>
              <div className="text-gray-600">Lead Generation Increase</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">50%</div>
              <div className="text-gray-600">Time Saved on Research</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
