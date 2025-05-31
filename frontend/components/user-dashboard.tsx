"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Layout } from "@/components/layout"
import { TimetableViewer } from "@/components/timetable-viewer"
import { FacultyViewer } from "@/components/faculty-viewer"
import { GraduationCap, Clock, MapPin, BookOpen } from "lucide-react"

export function UserDashboard() {
  const [activeTab, setActiveTab] = useState("timetables")

  const upcomingClasses = [
    {
      subject: "Advanced Mathematics",
      time: "09:00 - 10:30",
      room: "Room 101",
      faculty: "Dr. Smith",
      department: "Mathematics",
    },
    {
      subject: "Computer Science Fundamentals",
      time: "11:00 - 12:30",
      room: "Lab 205",
      faculty: "Prof. Johnson",
      department: "Computer Science",
    },
    {
      subject: "Physics Laboratory",
      time: "14:00 - 16:00",
      room: "Physics Lab",
      faculty: "Dr. Wilson",
      department: "Physics",
    },
  ]

  const todayStats = [
    {
      title: "Today's Classes",
      value: "6",
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      title: "Active Rooms",
      value: "12",
      icon: MapPin,
      color: "text-green-600",
    },
    {
      title: "Faculty Available",
      value: "28",
      icon: GraduationCap,
      color: "text-purple-600",
    },
    {
      title: "Next Class",
      value: "45 min",
      icon: Clock,
      color: "text-orange-600",
    },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">View your institution's timetables and faculty information</p>
        </div>

        {/* Today's Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {todayStats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timetables">Timetables</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="timetables">
            <TimetableViewer />
          </TabsContent>

          <TabsContent value="faculty">
            <FacultyViewer />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Classes</CardTitle>
                <CardDescription>Your scheduled classes for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingClasses.map((class_, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <span className="text-xs font-medium text-blue-600">{class_.time.split(" - ")[0]}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{class_.subject}</h3>
                          <p className="text-sm text-muted-foreground">
                            {class_.faculty} • {class_.room}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {class_.department}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{class_.time}</p>
                        <p className="text-sm text-muted-foreground">{class_.room}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
