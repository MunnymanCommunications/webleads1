"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CreateFollowUpDialog } from "@/components/create-followup-dialog"
import { FollowUpCalendar } from "@/components/followup-calendar"
import { useAuth } from "@/components/auth-provider"
import { crmApi } from "@/lib/crm-api"
import type { FollowUp, Contact, Company } from "@/lib/types"
import { Calendar, Clock, CheckCircle, XCircle, Plus, Mail, Phone, Users, FileText } from "lucide-react"

export default function FollowUpsPage() {
  const { session } = useAuth()
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    if (session?.client.id) {
      loadFollowUps()
    }
  }, [session])

  const loadFollowUps = async () => {
    if (!session?.client.id) return

    try {
      const [followUpsData, companiesData] = await Promise.all([
        crmApi.getFollowUps(session.client.id),
        crmApi.getCompanies(session.client.id),
      ])

      setFollowUps(followUpsData)
      setCompanies(companiesData)

      // Load all contacts
      const allContacts = []
      for (const company of companiesData) {
        const companyContacts = await crmApi.getContacts(company.id)
        allContacts.push(...companyContacts)
      }
      setContacts(allContacts)
    } catch (error) {
      console.error("Failed to load follow-ups:", error)
    } finally {
      setLoading(false)
    }
  }

  const getFollowUpsByStatus = (status: FollowUp["status"]) => {
    return followUps.filter((f) => f.status === status)
  }

  const getOverdueFollowUps = () => {
    return followUps.filter((f) => f.status === "pending" && new Date(f.scheduledAt) < new Date())
  }

  const getUpcomingFollowUps = () => {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    return followUps.filter(
      (f) => f.status === "pending" && new Date(f.scheduledAt) >= now && new Date(f.scheduledAt) <= tomorrow,
    )
  }

  const getContactName = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId)
    return contact ? `${contact.firstName} ${contact.lastName}` : "Unknown Contact"
  }

  const getCompanyName = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId)
    if (!contact) return "Unknown Company"
    const company = companies.find((c) => c.id === contact.companyId)
    return company?.name || "Unknown Company"
  }

  const getTypeIcon = (type: FollowUp["type"]) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "call":
        return <Phone className="h-4 w-4" />
      case "meeting":
        return <Users className="h-4 w-4" />
      case "note":
        return <FileText className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: FollowUp["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCreateFollowUp = async (followUpData: Omit<FollowUp, "id">) => {
    try {
      const newFollowUp = await crmApi.createFollowUp(followUpData)
      setFollowUps((prev) => [...prev, newFollowUp])
      setShowCreateDialog(false)
    } catch (error) {
      console.error("Failed to create follow-up:", error)
    }
  }

  const handleCompleteFollowUp = async (followUpId: string) => {
    // Mock completion - in real implementation, this would update the database
    setFollowUps((prev) =>
      prev.map((f) =>
        f.id === followUpId
          ? {
              ...f,
              status: "completed" as const,
              completedAt: new Date(),
            }
          : f,
      ),
    )
  }

  const stats = {
    total: followUps.length,
    pending: getFollowUpsByStatus("pending").length,
    completed: getFollowUpsByStatus("completed").length,
    overdue: getOverdueFollowUps().length,
    upcoming: getUpcomingFollowUps().length,
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Follow-ups</h1>
              <p className="text-gray-600">Manage and track all your lead follow-up activities</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Follow-up
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.completed}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.overdue}</p>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.upcoming}</p>
                    <p className="text-sm text-muted-foreground">Due Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {/* Overdue Follow-ups */}
              {getOverdueFollowUps().length > 0 && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-700 flex items-center gap-2">
                      <XCircle className="h-5 w-5" />
                      Overdue Follow-ups ({getOverdueFollowUps().length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getOverdueFollowUps().map((followUp) => (
                        <FollowUpCard
                          key={followUp.id}
                          followUp={followUp}
                          contactName={getContactName(followUp.contactId)}
                          companyName={getCompanyName(followUp.contactId)}
                          onComplete={() => handleCompleteFollowUp(followUp.id)}
                          isOverdue
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Upcoming Follow-ups */}
              {getUpcomingFollowUps().length > 0 && (
                <Card className="border-yellow-200">
                  <CardHeader>
                    <CardTitle className="text-yellow-700 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Due Today ({getUpcomingFollowUps().length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getUpcomingFollowUps().map((followUp) => (
                        <FollowUpCard
                          key={followUp.id}
                          followUp={followUp}
                          contactName={getContactName(followUp.contactId)}
                          companyName={getCompanyName(followUp.contactId)}
                          onComplete={() => handleCompleteFollowUp(followUp.id)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* All Follow-ups */}
              <Card>
                <CardHeader>
                  <CardTitle>All Follow-ups</CardTitle>
                  <CardDescription>Complete list of all follow-up activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading follow-ups...</div>
                  ) : followUps.length > 0 ? (
                    <div className="space-y-3">
                      {followUps
                        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                        .map((followUp) => (
                          <FollowUpCard
                            key={followUp.id}
                            followUp={followUp}
                            contactName={getContactName(followUp.contactId)}
                            companyName={getCompanyName(followUp.contactId)}
                            onComplete={() => handleCompleteFollowUp(followUp.id)}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No follow-ups yet</h3>
                      <p className="text-gray-600 mb-4">Create your first follow-up to start tracking activities.</p>
                      <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Follow-up
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar">
              <FollowUpCalendar followUps={followUps} contacts={contacts} companies={companies} />
            </TabsContent>
          </Tabs>

          {/* Create Follow-up Dialog */}
          <CreateFollowUpDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            contacts={contacts}
            companies={companies}
            onCreateFollowUp={handleCreateFollowUp}
            clientId={session?.client.id || ""}
            userId={session?.user.id || ""}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

// Follow-up Card Component
interface FollowUpCardProps {
  followUp: FollowUp
  contactName: string
  companyName: string
  onComplete: () => void
  isOverdue?: boolean
}

function FollowUpCard({ followUp, contactName, companyName, onComplete, isOverdue }: FollowUpCardProps) {
  const getTypeIcon = (type: FollowUp["type"]) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "call":
        return <Phone className="h-4 w-4" />
      case "meeting":
        return <Users className="h-4 w-4" />
      case "note":
        return <FileText className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: FollowUp["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div
      className={`flex items-center justify-between p-4 border rounded-lg ${isOverdue ? "border-red-200 bg-red-50" : ""}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {getTypeIcon(followUp.type)}
          <div>
            <p className="font-medium">{followUp.subject}</p>
            <p className="text-sm text-muted-foreground">
              {contactName} at {companyName}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">
            {new Date(followUp.scheduledAt).toLocaleDateString()} at{" "}
            {new Date(followUp.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
          <Badge className={`text-xs ${getStatusColor(followUp.status)}`}>{followUp.status}</Badge>
        </div>
        {followUp.status === "pending" && (
          <Button size="sm" onClick={onComplete}>
            <CheckCircle className="mr-1 h-3 w-3" />
            Complete
          </Button>
        )}
      </div>
    </div>
  )
}
