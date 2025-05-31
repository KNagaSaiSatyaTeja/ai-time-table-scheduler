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

interface TimetableModalProps {
  isOpen: boolean
  onClose: () => void
  timetable?: any
}

export function TimetableModal({ isOpen, onClose, timetable }: TimetableModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    semester: "",
    description: "",
    constraints: [] as string[],
    status: "draft",
  })

  const [newConstraint, setNewConstraint] = useState("")

  useEffect(() => {
    if (timetable) {
      setFormData({
        name: timetable.name || "",
        department: timetable.department || "",
        semester: timetable.semester || "",
        description: timetable.description || "",
        constraints: timetable.constraints || [],
        status: timetable.status || "draft",
      })
    } else {
      setFormData({
        name: "",
        department: "",
        semester: "",
        description: "",
        constraints: [],
        status: "draft",
      })
    }
  }, [timetable])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In real app, this would call your API
    console.log("Save timetable:", formData)
    onClose()
  }

  const addConstraint = () => {
    if (newConstraint.trim()) {
      setFormData((prev) => ({
        ...prev,
        constraints: [...prev.constraints, newConstraint.trim()],
      }))
      setNewConstraint("")
    }
  }

  const removeConstraint = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      constraints: prev.constraints.filter((_, i) => i !== index),
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{timetable ? "Edit Timetable" : "Create New Timetable"}</DialogTitle>
          <DialogDescription>
            {timetable
              ? "Update the timetable details and constraints."
              : "Create a new timetable for your institution."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Timetable Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Computer Science - Fall 2024"
                required
              />
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select
                value={formData.semester}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, semester: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                  <SelectItem value="Spring 2024">Spring 2024</SelectItem>
                  <SelectItem value="Summer 2024">Summer 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the timetable..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Constraints</Label>
            <div className="flex gap-2">
              <Input
                value={newConstraint}
                onChange={(e) => setNewConstraint(e.target.value)}
                placeholder="Add a constraint..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addConstraint())}
              />
              <Button type="button" onClick={addConstraint}>
                Add
              </Button>
            </div>
            {formData.constraints.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.constraints.map((constraint, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {constraint}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeConstraint(index)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{timetable ? "Update Timetable" : "Create Timetable"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
