"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, BookOpen, Users, Calendar } from "lucide-react";
import Layout from "./layout";
import { TimetableManagement } from "./timetable-management";
import { FacultyManagement } from "./faculty-management";
import { UserManagement } from "./user-management";

import { RoomManagement } from "./room-management";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";
import axios from "axios";
export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalSubjects: 0,
    totalTeachers: 0,
    totalStudents: 0,
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = localStorage.getItem("theme") || "light";

  useEffect(() => {
    const fetchDashboardData = async () => {
      // try {
      //   setLoading(true);
      //   const [statsResponse, activitiesResponse] = await Promise.all([
      //     axios.get("http://localhost:5000/api/stats", {
      //       headers: {
      //         Authorization: `Bearer ${localStorage.getItem("token")}`,
      //       },
      //     }),
      //     axios.get("http://localhost:5000/api/stats/recent-activity", {
      //       headers: {
      //         Authorization: `Bearer ${localStorage.getItem("token")}`,
      //       },
      //     }),
      //   ]);
      //   if (statsResponse.status !== 200 || activitiesResponse.status !== 200) {
      //     throw new Error("Failed to fetch dashboard data");
      //   }
      //   const statsData = statsResponse.data;
      //   const activitiesData = activitiesResponse.data;
      //   setStats(statsData.data);
      //   setActivities(activitiesData.data);
      // } catch (err: any) {
      //   console.error("Error fetching dashboard data:", err);
      //   setError(err.message);
      // } finally {
      //   setLoading(false);
      // }
    };

    fetchDashboardData();
  }, []);

  const handleGenerateTimetable = () => {
    setActiveTab("timetables");
  };

  const handleAddFaculty = () => {
    setActiveTab("faculty");
  };

  const handleManageUsers = () => {
    setActiveTab("users");
  };
  useEffect(() => {
    const theme = localStorage.getItem("theme") || "light";
  }, [theme]);
  return (
    <Layout>
      <div className="page-container">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your institution's scheduling system
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserNav />
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <div className="border-b">
              <div
                className={`overflow-x-auto ${
                  theme === "dark" ? "bg-[#0f0f0f]" : "bg-white"
                }`}
              >
                {" "}
                {/* or bg-gray-900 or bg-neutral-900 */}
                <TabsList
                  className={`inline-flex w-full h-10 items-center justify-start p-1 gap-1 md:gap-2 ${
                    theme === "dark" ? "bg-[#0f0f0f]" : "bg-white"
                  }`}
                >
                  <TabsTrigger
                    value="overview"
                    className="flex-1 min-w-[100px] max-w-[150px] px-3"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="timetables"
                    className="flex-1 min-w-[100px] max-w-[150px] px-3"
                  >
                    Timetables
                  </TabsTrigger>
                  <TabsTrigger
                    value="faculty"
                    className="flex-1 min-w-[100px] max-w-[150px] px-3"
                  >
                    Faculty
                  </TabsTrigger>
                  <TabsTrigger
                    value="rooms"
                    className="flex-1 min-w-[100px] max-w-[150px] px-3"
                  >
                    Rooms
                  </TabsTrigger>
                  <TabsTrigger
                    value="users"
                    className="flex-1 min-w-[100px] max-w-[150px] px-3"
                  >
                    Users
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="overview">
              <div className="overview-section">
                {/* Stats Grid */}
                <div className="dashboard-grid">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Rooms
                      </CardTitle>
                      <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.totalRooms}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Subjects
                      </CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.totalSubjects}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active Teachers
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.totalTeachers}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card className="quick-actions">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Manage rooms and subjects quickly
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Manage Rooms
                          </CardTitle>
                          <CardDescription>
                            Add or modify classroom information
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span>Available Rooms</span>
                              <span className="font-bold">
                                {stats.totalRooms}
                              </span>
                            </div>
                            <Button
                              className="w-full"
                              onClick={() => setActiveTab("rooms")}
                            >
                              <Building className="mr-2 h-4 w-4" />
                              Manage Rooms
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Manage Subjects
                          </CardTitle>
                          <CardDescription>
                            Add or modify subject details
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span>Total Subjects</span>
                              <span className="font-bold">
                                {stats.totalSubjects}
                              </span>
                            </div>
                            <Button
                              className="w-full"
                              onClick={() => setActiveTab("subjects")}
                            >
                              <BookOpen className="mr-2 h-4 w-4" />
                              Manage Subjects
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="timetables">
              <TimetableManagement />
            </TabsContent>

            <TabsContent value="faculty">
              <FacultyManagement />
            </TabsContent>

            <TabsContent value="rooms">
              <RoomManagement />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
