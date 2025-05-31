"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Mail, Phone, MapPin, BookOpen } from "lucide-react"

export function FacultyViewer() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  const faculty = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@university.edu",
      phone: "+1 (555) 123-4567",
      department: "Computer Science",
      position: "Professor",
      specialization: "Machine Learning, Artificial Intelligence",
      office: "CS Building, Room 301",
      courses: ["CS 101 - Intro to Programming", "CS 301 - Machine Learning", "CS 401 - Advanced AI"],
      officeHours: "Mon, Wed, Fri: 2:00 PM - 4:00 PM",
      bio: "Dr. Johnson has over 15 years of experience in machine learning and AI research.",
    },
    {
      id: 2,
      name: "Prof. Michael Smith",
      email: "michael.smith@university.edu",
      phone: "+1 (555) 234-5678",
      department: "Mathematics",
      position: "Associate Professor",
      specialization: "Calculus, Statistics, Applied Mathematics",
      office: "Math Building, Room 205",
      courses: ["MATH 101 - Calculus I", "MATH 201 - Statistics", "MATH 301 - Advanced Calculus"],
      officeHours: "Tue, Thu: 1:00 PM - 3:00 PM",
      bio: "Prof. Smith specializes in applied mathematics with a focus on statistical modeling.",
    },
    {
      id: 3,
      name: "Dr. Emily Wilson",
      email: "emily.wilson@university.edu",
      phone: "+1 (555) 345-6789",
      department: "Physics",
      position: "Assistant Professor",
      specialization: "Quantum Physics, Theoretical Physics",
      office: "Physics Building, Room 401",
      courses: ["PHYS 101 - General Physics", "PHYS 301 - Quantum Mechanics"],
      officeHours: "Mon, Wed: 10:00 AM - 12:00 PM",
      bio: "Dr. Wilson conducts research in quantum physics and theoretical applications.",
    },
    {
      id: 4,
      name: "Prof. David Brown",
      email: "david.brown@university.edu",
      phone: "+1 (555) 456-7890",
      department: "Computer Science",
      position: "Professor",
      specialization: "Software Engineering, Database Systems",
      office: "CS Building, Room 201",
      courses: ["CS 201 - Data Structures", "CS 302 - Database Systems", "CS 402 - Software Engineering"],
      officeHours: "Tue, Thu: 3:00 PM - 5:00 PM",
      bio: "Prof. Brown has extensive industry experience in software development and database design.",
    },
  ]

  const departments = ["all", "Computer Science", "Mathematics", "Physics"]

  const filteredFaculty = faculty.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.courses.some((course) => course.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesDepartment = selectedDepartment === "all" || member.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Faculty Directory</CardTitle>
          <CardDescription>Browse faculty members, their specializations, and contact information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search faculty, specializations, or courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept === "all" ? "All Departments" : dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {filteredFaculty.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={`/placeholder.svg?height=64&width=64`} />
                      <AvatarFallback className="text-lg">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <p className="text-muted-foreground">{member.position}</p>
                      <Badge variant="outline" className="mt-1">
                        {member.department}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Specialization</h4>
                    <p className="text-sm text-muted-foreground">{member.specialization}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">
                          {member.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{member.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{member.office}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Current Courses</h4>
                    <div className="space-y-1">
                      {member.courses.map((course, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-3 w-3 text-muted-foreground" />
                          <span>{course}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Office Hours</h4>
                    <p className="text-sm text-muted-foreground">{member.officeHours}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">About</h4>
                    <p className="text-sm text-muted-foreground">{member.bio}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
