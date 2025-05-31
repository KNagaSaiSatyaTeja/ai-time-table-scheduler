"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TimetableModal } from "@/components/timetable-modal"
import { Plus, Edit, Trash2, Brain, Download, Search, Filter } from "lucide-react"

export function TimetableManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTimetable, setEditingTimetable] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const timetables = [
    {
      id: 1,
      name: "Computer Science - Fall 2024",
      department: "Computer Science",
      semester: "Fall 2024",
      status: "active",
      lastGenerated: "2024-01-15",
      conflicts: 0,
      efficiency: 95,
    },
    {
      id: 2,
      name: "Mathematics - Fall 2024",
      department: "Mathematics",
      semester: "Fall 2024",
      status: "draft",
      lastGenerated: "2024-01-14",
      conflicts: 2,
      efficiency: 87,
    },
    {
      id: 3,
      name: "Physics - Fall 2024",
      department: "Physics",
      semester: "Fall 2024",
      status: "active",
      lastGenerated: "2024-01-13",
      conflicts: 1,
      efficiency: 92,
    },
  ]

  const handleEdit = (timetable: any) => {
    setEditingTimetable(timetable)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingTimetable(null)
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    // In real app, this would call your API
    console.log("Delete timetable:", id)
  }

  const handleGenerateAI = () => {
    // In real app, this would trigger AI generation
    console.log("Generate AI timetable")
  }

  const filteredTimetables = timetables.filter(
    (timetable) =>
      timetable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      timetable.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Timetable Management</CardTitle>
              <CardDescription>Create, edit, and manage institutional timetables with AI optimization</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleGenerateAI} className="gap-2">
                <Brain className="h-4 w-4" />
                Generate with AI
              </Button>
              <Button onClick={handleAdd} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Timetable
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search timetables..."
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
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Generated</TableHead>
                <TableHead>Conflicts</TableHead>
                <TableHead>Efficiency</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTimetables.map((timetable) => (
                <TableRow key={timetable.id}>
                  <TableCell className="font-medium">{timetable.name}</TableCell>
                  <TableCell>{timetable.department}</TableCell>
                  <TableCell>{timetable.semester}</TableCell>
                  <TableCell>
                    <Badge variant={timetable.status === "active" ? "default" : "secondary"}>{timetable.status}</Badge>
                  </TableCell>
                  <TableCell>{timetable.lastGenerated}</TableCell>
                  <TableCell>
                    <Badge variant={timetable.conflicts === 0 ? "default" : "destructive"}>{timetable.conflicts}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={timetable.efficiency > 90 ? "default" : "secondary"}>{timetable.efficiency}%</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(timetable)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(timetable.id)}>
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

      <TimetableModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} timetable={editingTimetable} />
    </div>
  )
}
