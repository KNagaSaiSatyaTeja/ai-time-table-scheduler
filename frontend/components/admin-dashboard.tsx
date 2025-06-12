// "use client";

// import { useState, useEffect } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Building, BookOpen, Users, Calendar } from "lucide-react";
// import Layout from "./layout";
// import TimetableManagement from "./timetable-management";
// import FacultyManagement from "./faculty-management";
// import { UserManagement } from "./user-management";

// import { RoomManagement } from "./room-management";
// import { ThemeToggle } from "./theme-toggle";
// import { UserNav } from "./user-nav";
// import axios from "axios";
// export function AdminDashboard() {
//   const [activeTab, setActiveTab] = useState("overview");
//   const [stats, setStats] = useState({
//     totalRooms: 0,
//     totalSubjects: 0,
//     totalTeachers: 0,
//     totalStudents: 0,
//   });
//   const [activities, setActivities] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const theme = localStorage.getItem("theme") || "light";

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       // try {
//       //   setLoading(true);
//       //   const [statsResponse, activitiesResponse] = await Promise.all([
//       //     axios.get("http://localhost:5000/api/stats", {
//       //       headers: {
//       //         Authorization: `Bearer ${localStorage.getItem("token")}`,
//       //       },
//       //     }),
//       //     axios.get("http://localhost:5000/api/stats/recent-activity", {
//       //       headers: {
//       //         Authorization: `Bearer ${localStorage.getItem("token")}`,
//       //       },
//       //     }),
//       //   ]);
//       //   if (statsResponse.status !== 200 || activitiesResponse.status !== 200) {
//       //     throw new Error("Failed to fetch dashboard data");
//       //   }
//       //   const statsData = statsResponse.data;
//       //   const activitiesData = activitiesResponse.data;
//       //   setStats(statsData.data);
//       //   setActivities(activitiesData.data);
//       // } catch (err: any) {
//       //   console.error("Error fetching dashboard data:", err);
//       //   setError(err.message);
//       // } finally {
//       //   setLoading(false);
//       // }
//     };

//     fetchDashboardData();
//   }, []);

//   const handleGenerateTimetable = () => {
//     setActiveTab("timetables");
//   };

//   const handleAddFaculty = () => {
//     setActiveTab("faculty");
//   };

//   const handleManageUsers = () => {
//     setActiveTab("users");
//   };
//   useEffect(() => {
//     const theme = localStorage.getItem("theme") || "light";
//   }, [theme]);
//   return (
//     <Layout>
//       <div className="page-container">
//         <div className="space-y-6">
//           <div className="flex items-center justify-between">
//             <div className="flex flex-col gap-2">
//               <h1 className="text-3xl font-bold">Admin Dashboard</h1>
//               <p className="text-muted-foreground">
//                 Manage your institution&apos;s scheduling system
//               </p>
//             </div>
//             <div className="flex items-center gap-4">
//               <ThemeToggle />
//               <UserNav />
//             </div>
//           </div>

//           <Tabs
//             value={activeTab}
//             onValueChange={setActiveTab}
//             className="space-y-6"
//           >
//             <div className="border-b">
//               <div
//                 className={`overflow-x-auto ${
//                   theme === "dark" ? "bg-[#0f0f0f]" : "bg-white"
//                 }`}
//               >
//                 {" "}
//                 {/* or bg-gray-900 or bg-neutral-900 */}
//                 <TabsList
//                   className={`inline-flex w-full h-10 items-center justify-start p-1 gap-1 md:gap-2 ${
//                     theme === "dark" ? "bg-[#0f0f0f]" : "bg-white"
//                   }`}
//                 >
//                   <TabsTrigger
//                     value="overview"
//                     className="flex-1 min-w-[100px] max-w-[150px] px-3"
//                   >
//                     Overview
//                   </TabsTrigger>
//                   <TabsTrigger
//                     value="timetables"
//                     className="flex-1 min-w-[100px] max-w-[150px] px-3"
//                   >
//                     Timetables
//                   </TabsTrigger>
//                   <TabsTrigger
//                     value="faculty"
//                     className="flex-1 min-w-[100px] max-w-[150px] px-3"
//                   >
//                     Faculty
//                   </TabsTrigger>
//                   <TabsTrigger
//                     value="rooms"
//                     className="flex-1 min-w-[100px] max-w-[150px] px-3"
//                   >
//                     Rooms
//                   </TabsTrigger>
//                   <TabsTrigger
//                     value="users"
//                     className="flex-1 min-w-[100px] max-w-[150px] px-3"
//                   >
//                     Users
//                   </TabsTrigger>
//                 </TabsList>
//               </div>
//             </div>

//             <TabsContent value="overview">
//               <div className="overview-section">
//                 {/* Stats Grid */}
//                 <div className="dashboard-grid">
//                   <Card>
//                     <CardHeader className="flex flex-row items-center justify-between pb-2">
//                       <CardTitle className="text-sm font-medium">
//                         Total Rooms
//                       </CardTitle>
//                       <Building className="h-4 w-4 text-muted-foreground" />
//                     </CardHeader>
//                     <CardContent>
//                       <div className="text-2xl font-bold">
//                         {stats.totalRooms}
//                       </div>
//                     </CardContent>
//                   </Card>

//                   <Card>
//                     <CardHeader className="flex flex-row items-center justify-between pb-2">
//                       <CardTitle className="text-sm font-medium">
//                         Total Subjects
//                       </CardTitle>
//                       <BookOpen className="h-4 w-4 text-muted-foreground" />
//                     </CardHeader>
//                     <CardContent>
//                       <div className="text-2xl font-bold">
//                         {stats.totalSubjects}
//                       </div>
//                     </CardContent>
//                   </Card>

//                   <Card>
//                     <CardHeader className="flex flex-row items-center justify-between pb-2">
//                       <CardTitle className="text-sm font-medium">
//                         Active Teachers
//                       </CardTitle>
//                       <Users className="h-4 w-4 text-muted-foreground" />
//                     </CardHeader>
//                     <CardContent>
//                       <div className="text-2xl font-bold">
//                         {stats.totalTeachers}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>

//                 {/* Quick Actions */}
//                 <Card className="quick-actions">
//                   <CardHeader>
//                     <CardTitle>Quick Actions</CardTitle>
//                     <CardDescription>
//                       Manage rooms and subjects quickly
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="grid gap-4 md:grid-cols-2">
//                       <Card>
//                         <CardHeader>
//                           <CardTitle className="text-lg">
//                             Manage Rooms
//                           </CardTitle>
//                           <CardDescription>
//                             Add or modify classroom information
//                           </CardDescription>
//                         </CardHeader>
//                         <CardContent>
//                           <div className="space-y-4">
//                             <div className="flex items-center justify-between">
//                               <span>Available Rooms</span>
//                               <span className="font-bold">
//                                 {stats.totalRooms}
//                               </span>
//                             </div>
//                             <Button
//                               className="w-full"
//                               onClick={() => setActiveTab("rooms")}
//                             >
//                               <Building className="mr-2 h-4 w-4" />
//                               Manage Rooms
//                             </Button>
//                           </div>
//                         </CardContent>
//                       </Card>

//                       <Card>
//                         <CardHeader>
//                           <CardTitle className="text-lg">
//                             Manage Subjects
//                           </CardTitle>
//                           <CardDescription>
//                             Add or modify subject details
//                           </CardDescription>
//                         </CardHeader>
//                         <CardContent>
//                           <div className="space-y-4">
//                             <div className="flex items-center justify-between">
//                               <span>Total Subjects</span>
//                               <span className="font-bold">
//                                 {stats.totalSubjects}
//                               </span>
//                             </div>
//                             <Button
//                               className="w-full"
//                               onClick={() => setActiveTab("subjects")}
//                             >
//                               <BookOpen className="mr-2 h-4 w-4" />
//                               Manage Subjects
//                             </Button>
//                           </div>
//                         </CardContent>
//                       </Card>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             </TabsContent>

//             <TabsContent value="timetables">
//               <TimetableManagement room={{}} isAdmin={true} />
//             </TabsContent>

//             <TabsContent value="faculty">
//               <FacultyManagement room={{}} isAdmin={true} />
//             </TabsContent>

//             <TabsContent value="rooms">
//               <RoomManagement />
//             </TabsContent>

//             <TabsContent value="users">
//               <UserManagement />
//             </TabsContent>
//           </Tabs>
//         </div>
//       </div>
//     </Layout>
//   );
// }
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
import TimetableManagement from "./timetable-management";
import FacultyManagement from "./faculty-management";
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

  // Admin-specific stats with icons and colors
  const adminStats = [
    {
      title: "Total Rooms",
      value: stats.totalRooms.toString(),
      icon: Building,
      color: "text-blue-600",
      description: "Available classrooms",
    },
    {
      title: "Total Subjects",
      value: stats.totalSubjects.toString(),
      icon: BookOpen,
      color: "text-green-600",
      description: "Course offerings",
    },
    {
      title: "Active Teachers",
      value: stats.totalTeachers.toString(),
      icon: Users,
      color: "text-purple-600",
      description: "Faculty members",
    },
    {
      title: "Total Students",
      value: stats.totalStudents.toString(),
      icon: Users,
      color: "text-orange-600",
      description: "Enrolled students",
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your institution&apos;s scheduling system
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>

        {/* Stats Grid - Matching User Dashboard Style */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {adminStats.map((stat, index) => (
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
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timetables">Timetables</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Manage your institution&apos;s resources efficiently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Manage Rooms</h3>
                        <p className="text-sm text-muted-foreground">
                          {stats.totalRooms} available
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("rooms")}
                    >
                      Manage
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg">
                        <BookOpen className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Manage Subjects</h3>
                        <p className="text-sm text-muted-foreground">
                          {stats.totalSubjects} subjects
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("rooms")}
                    >
                      Manage
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Manage Faculty</h3>
                        <p className="text-sm text-muted-foreground">
                          {stats.totalTeachers} teachers
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("faculty")}
                    >
                      Manage
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <Calendar className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Generate Timetable</h3>
                        <p className="text-sm text-muted-foreground">
                          Create schedules
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateTimetable}
                    >
                      Generate
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg">
                        <Users className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Manage Users</h3>
                        <p className="text-sm text-muted-foreground">
                          User accounts
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManageUsers}
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>
                  Current system health and activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database Connection</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Connected</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">
                        Operational
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Backup</span>
                    <span className="text-sm text-muted-foreground">
                      2 hours ago
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timetables">
            <TimetableManagement room={{}} isAdmin={true} />
          </TabsContent>

          <TabsContent value="faculty">
            <FacultyManagement room={{}} isAdmin={true} />
          </TabsContent>

          <TabsContent value="rooms">
            <RoomManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}