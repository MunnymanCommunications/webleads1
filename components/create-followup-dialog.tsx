"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FollowUp, Contact, Company } from "@/lib/types"
import { Calendar, Mail, Phone, Users, FileText } from "lucide-react"

interface CreateFollowUpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contacts: Contact[]
  companies: Company[]
  onCreateFollowUp: (followUp: Omit<FollowUp, "id">) => void
  clientId: string
  userId: string
}

export function CreateFollowUpDialog({
  open,
  onOpenChange,
  contacts,
  companies,
  onCreateFollowUp,
  clientId,
  userId,
}: CreateFollowUpDialogProps) {
  const [formData, setFormData] = useState({
    contactId: "",
    type: "email" as FollowUp["type"],
    subject: "",
    content: "",
    scheduledAt: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.contactId || !formData.subject || !formData.scheduledAt) {
      return
    }

    const followUp: Omit<FollowUp, "id"> = {
      contactId: formData.contactId,
      type: formData.type,
      subject: formData.subject,
      content: formData.content,
      status: "pending",
      scheduledAt: new Date(formData.scheduledAt),
      createdBy: userId,
      clientId,
    }

    onCreateFollowUp(followUp)

    // Reset form
    setFormData({
      contactId: "",
      type: "email",
      subject: "",
      content: "",
      scheduledAt: "",
    })
  }

  const getContactCompany = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId)
    if (!contact) return ""
    const company = companies.find((c) => c.id === contact.companyId)
    return company?.name || ""
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

  const getDefaultSubject = (type: FollowUp["type"], contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId)
    const contactName = contact ? `${contact.firstName} ${contact.lastName}` : "Contact"

    switch (type) {
      case "email":
        return `Follow-up email to ${contactName}`
      case "call":
        return `Call ${contactName}`
      case "meeting":
        return `Meeting with ${contactName}`
      case "note":
        return `Note about ${contactName}`
      default:
        return `Follow-up with ${contactName}`
    }
  }

  const handleTypeChange = (type: FollowUp["type"]) => {
    setFormData((prev) => ({
      ...prev,
      type,
      subject: prev.contactId ? getDefaultSubject(type, prev.contactId) : prev.subject,
    }))
  }

  const handleContactChange = (contactId: string) => {
    setFormData((prev) => ({
      ...prev,
      contactId,
      subject: getDefaultSubject(prev.type, contactId),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Follow-up</DialogTitle>
          <DialogDescription>Schedule a new follow-up activity with a contact.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact">Contact</Label>
            <Select value={formData.contactId} onValueChange={handleContactChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    <div className="flex flex-col">
                      <span>
                        {contact.firstName} {contact.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">{getContactCompany(contact.id)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                </SelectItem>
                <SelectItem value="call">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Call
                  </div>
                </SelectItem>
                <SelectItem value="meeting">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Meeting
                  </div>
                </SelectItem>
                <SelectItem value="note">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Note
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
              placeholder="Follow-up subject"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Notes (Optional)</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Additional notes or details about this follow-up..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Follow-up</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
