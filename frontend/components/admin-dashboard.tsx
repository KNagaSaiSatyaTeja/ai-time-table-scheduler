"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/layout";
import { TimetableManagement } from "@/components/timetable-management";
import { FacultyManagement } from "@/components/faculty-management";
import { UserManagement } from "@/components/user-management";
import { SubjectManagement } from "@/components/subject-management";
import {
  Users,
  Calendar,
  GraduationCap,
  Brain,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    {
      title: "Total Faculty",
      value: "45",
      change: "+3 this month",
      icon: GraduationCap,
      color: "text-blue-600",
    },
    {
      title: "Active Timetables",
      value: "12",
      change: "2 pending approval",
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "System Users",
      value: "156",
      change: "+12 this week",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "AI Optimization",
      value: "94%",
      change: "Efficiency rate",
      icon: Brain,
      color: "text-orange-600",
    },
  ];

  const recentActivity = [
    {
      action: "Timetable generated for Computer Science Dept.",
      time: "2 hours ago",
      status: "completed",
      user: "AI System",
    },
    {
      action: "New faculty member added: Dr. Sarah Johnson",
      time: "4 hours ago",
      status: "completed",
      user: "Admin",
    },
    {
      action: "Timetable optimization in progress for Mathematics Dept.",
      time: "6 hours ago",
      status: "pending",
      user: "AI System",
    },
    {
      action: "Room conflict resolved in Building A",
      time: "1 day ago",
      status: "completed",
      user: "Dr. Mike Wilson",
    },
  ];
  const handleGenerateTimetable = () => {
    setActiveTab("timetables");
  };

  const handleAddFaculty = () => {
    setActiveTab("faculty");
  };

  const handleManageUsers = () => {
    setActiveTab("users");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your institution's scheduling system with AI-powered
            optimization
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="border-b">
            <div className="overflow-x-auto">
              <TabsList className="inline-flex min-w-full h-10 items-center justify-start p-1">
                <TabsTrigger value="overview" className="min-w-[100px]">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="timetables" className="min-w-[100px]">
                  Timetables
                </TabsTrigger>
                <TabsTrigger value="faculty" className="min-w-[100px]">
                  Faculty
                </TabsTrigger>
                <TabsTrigger value="subjects" className="min-w-[100px]">
                  Subjects
                </TabsTrigger>
                <TabsTrigger value="users" className="min-w-[100px]">
                  Users
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Frequently used administrative functions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button className="h-20 flex flex-col gap-2">
                    <Brain className="h-6 w-6" />
                    Generate AI Timetable
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={handleAddFaculty}
                  >
                    <GraduationCap className="h-6 w-6" />
                    Add Faculty Member
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => {
                      handleManageUsers();
                    }}
                  >
                    <Users className="h-6 w-6" />
                    Manage Users
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest system activities and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {activity.status === "completed" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">
                            by {activity.user} • {activity.time}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          activity.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timetables">
            <TimetableManagement />
          </TabsContent>

          <TabsContent value="faculty">
            <FacultyManagement />
          </TabsContent>

          <TabsContent value="subjects">
            <SubjectManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
