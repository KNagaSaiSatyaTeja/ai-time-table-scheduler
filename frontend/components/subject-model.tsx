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
import { Room, Faculty, TimeSlot } from "@/types/room";
import { toast } from "sonner";
import { X, Plus, Loader2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import axios from "axios";

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: Room | null;
  onSuccess: () => void;
}

interface FormDataType {
  name: string;
  year: number;
  code: string;
  semester: number;
  department?: string;
  faculty: string[];
  facultyTimeSlots: Record<string, TimeSlot[]>;
}

// Dummy Faculty Data
const dummyFaculty: Faculty[] = [
  {
    _id: "1",
    name: "Dr. Alice Smith",
    department: "Computer Science",
    availability: [
      { day: "Monday", startTime: "09:00", endTime: "11:00" },
      { day: "Wednesday", startTime: "10:00", endTime: "12:00" },
    ],
  },
  {
    _id: "2",
    name: "Prof. Bob Johnson",
    department: "Mechanical Engineering",
    availability: [
      { day: "Tuesday", startTime: "08:00", endTime: "10:00" },
      { day: "Thursday", startTime: "11:00", endTime: "13:00" },
    ],
  },
  {
    _id: "3",
    name: "Dr. Carol Davis",
    department: "Electrical Engineering",
    availability: [
      { day: "Friday", startTime: "09:00", endTime: "11:00" },
    ],
  },
];

export function SubjectModel({
  isOpen,
  onClose,
  room,
  onSuccess,
}: RoomModalProps) {
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    year: 1,
    semester: 1,
    faculty: [],
    code: "",
    facultyTimeSlots: {},
  });

  const [loading, setLoading] = useState(false);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const timeSlots = Array.from({ length: 12 }, (_, i) => `${(8 + i).toString().padStart(2, "0")}:00`);

  useEffect(() => {
    // Use dummy faculty instead of API
    setFaculty(dummyFaculty);
  }, []);

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        code: room.code || "",
        year: room.year,
        semester: room.semester,
        department: room.department || "",
        faculty: room.faculty?.map((f) => f._id) || [],
        facultyTimeSlots: {},
      });
    } else {
      setFormData({
        name: "",
        code: "",
        year: 1,
        semester: 1,
        department: "",
        faculty: [],
        facultyTimeSlots: {},
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

      const response = await axios[method](endpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        toast.success(room ? "Room updated successfully" : "Room added successfully");
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to save room";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyTimeSlotChange = (
    facultyId: string,
    day: string,
    startTime: string,
    endTime: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      facultyTimeSlots: {
        ...prev.facultyTimeSlots,
        [facultyId]: [
          ...(prev.facultyTimeSlots[facultyId] || []),
          { day, startTime, endTime } as TimeSlot,
        ],
      },
    }));
  };

  const removeFacultyTimeSlot = (facultyId: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      facultyTimeSlots: {
        ...prev.facultyTimeSlots,
        [facultyId]: prev.facultyTimeSlots[facultyId].filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-[85vw] lg:max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {room ? "Edit Subject" : "Add New Subject"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 h-[calc(90vh-180px)]">
          <form id="room-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  placeholder="Enter subject name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  placeholder="Enter subject code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Faculty</Label>
              <Select
                value={formData.faculty[0] || ""}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    faculty: [value],
                    facultyTimeSlots: {},
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculty.map((f) => (
                    <SelectItem key={f._id} value={f._id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Year</Label>
                <Select
                  value={formData.year.toString()}
                  onValueChange={(value) => setFormData({ ...formData, year: parseInt(value) })}
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
                  onValueChange={(value) => setFormData({ ...formData, semester: parseInt(value) })}
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

            {formData.faculty[0] && (
              <div className="space-y-3">
                <Label>Faculty Availability</Label>
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span>
                      {faculty.find((f) => f._id === formData.faculty[0])?.name}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleFacultyTimeSlotChange(
                          formData.faculty[0],
                          daysOfWeek[0],
                          timeSlots[0],
                          timeSlots[1]
                        )
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Time Slot
                    </Button>
                  </div>

                  {formData.facultyTimeSlots[formData.faculty[0]]?.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Select
                        value={slot.day}
                        onValueChange={(day) =>
                          handleFacultyTimeSlotChange(
                            formData.faculty[0],
                            day,
                            slot.startTime,
                            slot.endTime
                          )
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {daysOfWeek.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={slot.startTime}
                        onValueChange={(time) =>
                          handleFacultyTimeSlotChange(
                            formData.faculty[0],
                            slot.day,
                            time,
                            slot.endTime
                          )
                        }
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <span>to</span>

                      <Select
                        value={slot.endTime}
                        onValueChange={(time) =>
                          handleFacultyTimeSlotChange(
                            formData.faculty[0],
                            slot.day,
                            slot.startTime,
                            time
                          )
                        }
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeFacultyTimeSlot(formData.faculty[0], index)
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
    </Dialog>
  );
}
export default SubjectModel;