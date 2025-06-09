"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface TimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}

export function TimetableModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
}: TimetableModalProps) {
  const [formData, setFormData] = useState({
    college_time: {
      startTime: "09:30",
      endTime: "16:30",
    },
    break_: [
      {
        day: "ALL_DAYS",
        startTime: "13:00",
        endTime: "14:00",
      },
    ],
    rooms: ["R1"],
    subjects: [
      {
        name: "",
        duration: 50,
        time: 50,
        no_of_classes_per_week: 4,
        faculty: [],
      },
    ],
    department: "Computer Science",
    semester: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate New Timetable</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Department</Label>
            <Input
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label>Semester</Label>
            <Input
              type="number"
              value={formData.semester}
              onChange={(e) =>
                setFormData({ ...formData, semester: parseInt(e.target.value) })
              }
              required
            />
          </div>
          {/* Add more form fields for subjects, faculty, etc. */}
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Timetable
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
