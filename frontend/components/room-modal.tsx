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
import { X, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { SubjectModel } from "./subject-model";
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

  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  // Fetch subjects and faculty on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [subjectsRes, facultyRes] = await Promise.all([
          axios.get("http://localhost:5000/api/subjects", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/faculty", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setSubjects(subjectsRes.data.data);
        setFaculty(facultyRes.data.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load subjects and faculty");
      }
    };

    fetchData();
  }, []);

  // Initialize form data when room prop changes
  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        building: room.building,
        capacity: room.capacity,
        year: room.year,
        semester: room.semester,
        subjects: room.subjects?.map((subject) => subject._id) || [],
        department: room.department || "",
        faculty: room.faculty?.map((f) => f._id) || [],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const endpoint = room
        ? `http://localhost:5000/api/rooms/${room._id}`
        : "http://localhost:5000/api/rooms";

      const method = room ? "put" : "post";

      const response =
       method === "put"
        ? await axios.put(endpoint, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
        : await axios.post(endpoint, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to save room";
      toast.error(errorMessage);
      console.error("Room save error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add function to refresh subjects after new subject is added
  const handleSubjectAdded = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/subjects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(response.data.data);
    } catch (error) {
      console.error("Failed to refresh subjects:", error);
      toast.error("Failed to refresh subjects list");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-[85vw] lg:max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {room ? "Edit Room" : "Add New Room"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 h-[calc(90vh-180px)]">
          <form id="room-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-medium">
                  Room Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter room name"
                  className="w-full"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="building" className="text-sm font-medium">
                  Building
                </Label>
                <Input
                  id="building"
                  placeholder="Enter building name"
                  className="w-full"
                  value={formData.building}
                  onChange={(e) =>
                    setFormData({ ...formData, building: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="department" className="text-sm font-medium">
                  Department
                </Label>
                <Input
                  id="department"
                  placeholder="Enter department name"
                  className="w-full"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="capacity" className="text-sm font-medium">
                  Capacity
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="Enter room capacity"
                  className="w-full"
                  min="1"
                  value={formData.capacity || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Subjects</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSubjectModalOpen(true)}
                  className="h-8 px-3"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Subject
                </Button>
              </div>
              <div className="border rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 max-h-[200px] overflow-y-auto">
                  {subjects.map((subject: any) => (
                    <div
                      key={subject._id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`subject-${subject._id}`}
                        checked={formData.subjects.includes(subject._id)}
                        onCheckedChange={(checked) => {
                          setFormData((prev) => ({
                            ...prev,
                            subjects: checked
                              ? [...prev.subjects, subject._id]
                              : prev.subjects.filter(
                                  (id) => id !== subject._id
                                ),
                          }));
                        }}
                      />
                      <Label
                        htmlFor={`subject-${subject._id}`}
                        className="text-sm cursor-pointer"
                      >
                        {subject.name} ({subject.code})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Faculty</Label>
              <div className="border rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 max-h-[200px] overflow-y-auto">
                  {faculty.map((f: any) => (
                    <div key={f._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`faculty-${f._id}`}
                        checked={formData.faculty?.includes(f._id)}
                        onCheckedChange={(checked) => {
                          setFormData((prev) => ({
                            ...prev,
                            faculty: checked
                              ? [...(prev.faculty || []), f._id]
                              : (prev.faculty || []).filter(
                                  (id) => id !== f._id
                                ),
                          }));
                        }}
                      />
                      <label htmlFor={`faculty-${f._id}`} className="text-sm">
                        {f.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    {[1, 2, 3, 4].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        Year {year}
                      </SelectItem>
                    ))}
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
          </form>
        </ScrollArea>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-background">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="room-form" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {room ? "Updating..." : "Adding..."}
              </>
            ) : room ? (
              "Update"
            ) : (
              "Add"
            )}
          </Button>
        </div>
      </DialogContent>

      <SubjectModel
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        onSuccess={handleSubjectAdded}
      />
    </Dialog>
  );
}
