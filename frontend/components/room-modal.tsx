"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Room } from "@/types/room";
import axios from "axios";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "./ui/checkbox";

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: Room | null;
  onSuccess: () => void;
}

interface FormDataType {
  name: string;
  building: string;
  capacity: number;
  year: number;
  semester: number;
  subjects: string[];
  department: string;
  faculty?: string[];
}

export function RoomModal({
  isOpen,
  onClose,
  room,
  onSuccess,
}: RoomModalProps) {
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    building: "",
    capacity: 0,
    year: 1,
    semester: 1,
    subjects: [],
    department: "",
    faculty: [],
  });

  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(false);

  const [subjects, setSubjects] = useState([
    { id: "1", name: "Mathematics" },
    { id: "2", name: "Physics" },
  ]);

  const facultyOptions: { _id: string; name: string; department: string }[] = [
    { _id: "f1", name: "Dr. Smith", department: "CS" },
    { _id: "f2", name: "Prof. Johnson", department: "Math" },
    { _id: "f3", name: "Dr. Lee", department: "Physics" },
    { _id: "f4", name: "Prof. Adams", department: "CS" },
  ];

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        building: room.building,
        capacity: room.capacity,
        year: room.year,
        semester: room.semester,
        subjects: room.subjects?.map((subject) => subject.id) || [],
        department: room.department || "",
        faculty: room.faculty?.map((faculty) => faculty._id) || [],
      });
    } else {
      setFormData({
        name: "",
        building: "",
        capacity: 0,
        year: 1,
        semester: 1,
        subjects: [],
        department: "",
        faculty: [],
      });
    }
  }, [room]);

  const handleAddSubject = () => {
    if (selectedSubject && !formData.subjects.includes(selectedSubject)) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, selectedSubject],
      });
      setSelectedSubject("");
    }
  };

  const handleRemoveSubject = (subjectToRemove: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter(
        (subject) => subject !== subjectToRemove
      ),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      if (room) {
        await axios.put(
          `http://localhost:5000/api/rooms/${room._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Room updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/rooms/addRoom", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        toast.success("Room added successfully");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save room");
      console.error("Room save error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-full max-w-3xl">
        <DialogHeader>
          <DialogTitle>{room ? "Edit Room" : "Add New Room"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-2 sm:px-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Room Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="building">Building</Label>
            <Input
              id="building"
              value={formData.building}
              onChange={(e) =>
                setFormData({ ...formData, building: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: parseInt(e.target.value) })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Subjects</Label>
            <div className="flex gap-2">
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddSubject}
                disabled={!selectedSubject}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {formData.subjects.length > 0 && (
            <div className="border rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                {formData.subjects.map((subjectId) => {
                  const subject = subjects.find((s) => s.id === subjectId);
                  return (
                    <Badge
                      key={subjectId}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {subject?.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(subjectId)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Faculty</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {facultyOptions.map((faculty) => (
                <div key={faculty._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={faculty._id}
                    checked={formData.faculty?.includes(faculty._id) ?? false}
                    onCheckedChange={(checked) => {
                      setFormData((prev) => {
                        const newFaculty = checked
                          ? [...(prev.faculty ?? []), faculty._id]
                          : (prev.faculty ?? []).filter(
                              (id) => id !== faculty._id
                            );
                        return { ...prev, faculty: newFaculty };
                      });
                    }}
                  />
                  <label
                    htmlFor={faculty._id}
                    className="text-sm font-medium leading-none"
                  >
                    {faculty.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Year</Label>
              <Select
                value={formData.year.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, year: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">First Year</SelectItem>
                  <SelectItem value="2">Second Year</SelectItem>
                  <SelectItem value="3">Third Year</SelectItem>
                  <SelectItem value="4">Fourth Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select
                value={formData.semester.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, semester: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">First Semester</SelectItem>
                  <SelectItem value="2">Second Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : room ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
