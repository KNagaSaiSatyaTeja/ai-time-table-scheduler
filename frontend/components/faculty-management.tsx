"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FacultyModal } from "@/components/faculty-modal"
import { Plus, Edit, Trash2, Search, Filter, Mail } from "lucide-react"

export function FacultyManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFaculty, setEditingFaculty] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const faculty = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@university.edu",
      phone: "+1 (555) 123-4567",
      department: "Computer Science",
      position: "Professor",
      specialization: "Machine Learning, AI",
      status: "active",
      courses: ["CS 101", "CS 301", "CS 401"],
      availability: "Full-time",
    },
    {
      id: 2,
      name: "Prof. Michael Smith",
      email: "michael.smith@university.edu",
      phone: "+1 (555) 234-5678",
      department: "Mathematics",
      position: "Associate Professor",
      specialization: "Calculus, Statistics",
      status: "active",
      courses: ["MATH 101", "MATH 201"],
      availability: "Part-time",
    },
    {
      id: 3,
      name: "Dr. Emily Wilson",
      email: "emily.wilson@university.edu",
      phone: "+1 (555) 345-6789",
      department: "Physics",
      position: "Assistant Professor",
      specialization: "Quantum Physics",
      status: "on-leave",
      courses: ["PHYS 101", "PHYS 301"],
      availability: "Full-time",
    },
  ]

  const handleEdit = (facultyMember: any) => {
    setEditingFaculty(facultyMember)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingFaculty(null)
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    // In real app, this would call your API
    console.log("Delete faculty:", id)
  }

  const filteredFaculty = faculty.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.specialization.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Faculty Management</CardTitle>
              <CardDescription>Manage faculty members, their details, and course assignments</CardDescription>
            </div>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Faculty
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search faculty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Faculty</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaculty.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{member.department}</TableCell>
                  <TableCell>{member.position}</TableCell>
                  <TableCell>{member.specialization}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.courses.slice(0, 2).map((course, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {course}
                        </Badge>
                      ))}
                      {member.courses.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.courses.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.status === "active"
                          ? "default"
                          : member.status === "on-leave"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(member)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(member.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <FacultyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} faculty={editingFaculty} />
    </div>
  )
}
