"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { FollowUp, Contact, Company } from "@/lib/types"
import { ChevronLeft, ChevronRight, Calendar, Mail, Phone, Users, FileText } from "lucide-react"

interface FollowUpCalendarProps {
  followUps: FollowUp[]
  contacts: Contact[]
  companies: Company[]
}

export function FollowUpCalendar({ followUps, contacts, companies }: FollowUpCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

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
        return <Mail className="h-3 w-3" />
      case "call":
        return <Phone className="h-3 w-3" />
      case "meeting":
        return <Users className="h-3 w-3" />
      case "note":
        return <FileText className="h-3 w-3" />
      default:
        return <Calendar className="h-3 w-3" />
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

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  // Get follow-ups for a specific date
  const getFollowUpsForDate = (date: Date) => {
    return followUps.filter((followUp) => {
      const followUpDate = new Date(followUp.scheduledAt)
      return (
        followUpDate.getDate() === date.getDate() &&
        followUpDate.getMonth() === date.getMonth() &&
        followUpDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const calendarDays = getCalendarDays()
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Follow-up Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dayFollowUps = getFollowUpsForDate(day)
            const isCurrentMonth = day.getMonth() === currentDate.getMonth()
            const isToday = day.toDateString() === new Date().toDateString()

            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 border rounded-lg ${
                  isCurrentMonth ? "bg-white" : "bg-gray-50"
                } ${isToday ? "ring-2 ring-blue-500" : ""}`}
              >
                <div className={`text-sm font-medium mb-1 ${isCurrentMonth ? "text-gray-900" : "text-gray-400"}`}>
                  {day.getDate()}
                </div>

                <div className="space-y-1">
                  {dayFollowUps.slice(0, 3).map((followUp) => (
                    <div
                      key={followUp.id}
                      className="text-xs p-1 rounded bg-blue-100 text-blue-800 flex items-center gap-1 truncate"
                    >
                      {getTypeIcon(followUp.type)}
                      <span className="truncate">{followUp.subject}</span>
                    </div>
                  ))}
                  {dayFollowUps.length > 3 && (
                    <div className="text-xs text-muted-foreground">+{dayFollowUps.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-100 rounded"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 rounded"></div>
            <span>Cancelled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
