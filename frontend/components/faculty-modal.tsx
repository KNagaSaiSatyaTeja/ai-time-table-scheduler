"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface FacultyModalProps {
  isOpen: boolean
  onClose: () => void
  faculty?: any
}

export function FacultyModal({ isOpen, onClose, faculty }: FacultyModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    specialization: "",
    office: "",
    status: "active",
    availability: "full-time",
    courses: [] as string[],
    officeHours: "",
    bio: "",
  })

  const [newCourse, setNewCourse] = useState("")

  useEffect(() => {
    if (faculty) {
      setFormData({
        name: faculty.name || "",
        email: faculty.email || "",
        phone: faculty.phone || "",
        department: faculty.department || "",
        position: faculty.position || "",
        specialization: faculty.specialization || "",
        office: faculty.office || "",
        status: faculty.status || "active",
        availability: faculty.availability || "full-time",
        courses: faculty.courses || [],
        officeHours: faculty.officeHours || "",
        bio: faculty.bio || "",
      })
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        department: "",
        position: "",
        specialization: "",
        office: "",
        status: "active",
        availability: "full-time",
        courses: [],
        officeHours: "",
        bio: "",
      })
    }
  }, [faculty])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In real app, this would call your API
    console.log("Save faculty:", formData)
    onClose()
  }

  const addCourse = () => {
    if (newCourse.trim()) {
      setFormData((prev) => ({
        ...prev,
        courses: [...prev.courses, newCourse.trim()],
      }))
      setNewCourse("")
    }
  }

  const removeCourse = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== index),
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{faculty ? "Edit Faculty Member" : "Add New Faculty Member"}</DialogTitle>
          <DialogDescription>
            {faculty
              ? "Update the faculty member details and course assignments."
              : "Add a new faculty member to your institution."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Dr. John Smith"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="john.smith@university.edu"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="office">Office</Label>
              <Input
                id="office"
                value={formData.office}
                onChange={(e) => setFormData((prev) => ({ ...prev, office: e.target.value }))}
                placeholder="CS Building, Room 301"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, position: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professor">Professor</SelectItem>
                  <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                  <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                  <SelectItem value="Lecturer">Lecturer</SelectItem>
                  <SelectItem value="Adjunct Professor">Adjunct Professor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Select
                value={formData.availability}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, availability: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="visiting">Visiting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              value={formData.specialization}
              onChange={(e) => setFormData((prev) => ({ ...prev, specialization: e.target.value }))}
              placeholder="Machine Learning, Artificial Intelligence"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="officeHours">Office Hours</Label>
            <Input
              id="officeHours"
              value={formData.officeHours}
              onChange={(e) => setFormData((prev) => ({ ...prev, officeHours: e.target.value }))}
              placeholder="Mon, Wed, Fri: 2:00 PM - 4:00 PM"
            />
          </div>

          <div className="space-y-2">
            <Label>Courses</Label>
            <div className="flex gap-2">
              <Input
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                placeholder="Add a course..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCourse())}
              />
              <Button type="button" onClick={addCourse}>
                Add
              </Button>
            </div>
            {formData.courses.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.courses.map((course, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {course}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeCourse(index)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biography</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Brief biography and research interests..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{faculty ? "Update Faculty" : "Add Faculty"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
