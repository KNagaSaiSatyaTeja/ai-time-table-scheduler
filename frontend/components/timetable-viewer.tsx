"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Clock, MapPin } from "lucide-react"

export function TimetableViewer() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedSemester, setSelectedSemester] = useState("fall-2024")

  const timetables = [
    {
      id: 1,
      course: "Advanced Mathematics",
      code: "MATH 301",
      faculty: "Dr. Smith",
      room: "Room 101",
      time: "09:00 - 10:30",
      days: ["Monday", "Wednesday", "Friday"],
      department: "Mathematics",
      semester: "Fall 2024",
      students: 45,
    },
    {
      id: 2,
      course: "Computer Science Fundamentals",
      code: "CS 101",
      faculty: "Prof. Johnson",
      room: "Lab 205",
      time: "11:00 - 12:30",
      days: ["Tuesday", "Thursday"],
      department: "Computer Science",
      semester: "Fall 2024",
      students: 60,
    },
    {
      id: 3,
      course: "Physics Laboratory",
      code: "PHYS 201",
      faculty: "Dr. Wilson",
      room: "Physics Lab",
      time: "14:00 - 16:00",
      days: ["Monday", "Wednesday"],
      department: "Physics",
      semester: "Fall 2024",
      students: 30,
    },
    {
      id: 4,
      course: "Data Structures",
      code: "CS 201",
      faculty: "Prof. Davis",
      room: "Room 301",
      time: "10:00 - 11:30",
      days: ["Monday", "Wednesday", "Friday"],
      department: "Computer Science",
      semester: "Fall 2024",
      students: 55,
    },
  ]

  const departments = ["all", "Computer Science", "Mathematics", "Physics"]
  const semesters = ["fall-2024", "spring-2024", "summer-2024"]

  const filteredTimetables = timetables.filter((timetable) => {
    const matchesSearch =
      timetable.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      timetable.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      timetable.faculty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || timetable.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Timetable Viewer</CardTitle>
              <CardDescription>View current semester timetables and course schedules</CardDescription>
            </div>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Export Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses, codes, or faculty..."
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
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem key={semester} value={semester}>
                    {semester.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Students</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTimetables.map((timetable) => (
                <TableRow key={timetable.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{timetable.course}</p>
                      <p className="text-sm text-muted-foreground">{timetable.code}</p>
                    </div>
                  </TableCell>
                  <TableCell>{timetable.faculty}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{timetable.time}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {timetable.days.map((day, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {day.slice(0, 3)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{timetable.room}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{timetable.department}</Badge>
                  </TableCell>
                  <TableCell>{timetable.students}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
