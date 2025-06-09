"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TimetableModal } from "@/components/timetable-modal";
import { Plus, Brain, Download } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { Timetable } from "@/types/timetable";
import { TimetableFormData } from "@/types/timetable";

export function TimetableManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/timetable", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTimetables(response.data.timetables);
    } catch (error) {
      toast.error("Failed to fetch timetables");
    }
  };

  const handleGenerateTimetable = async (data: TimetableFormData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/timetable/generate",
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.timetable) {
        toast.success("Timetable generated successfully");
        fetchTimetables();
        setIsModalOpen(false);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to generate timetable"
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadTimetable = async (id: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/timetable/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Convert the HTML table to a downloadable file
      const blob = new Blob([response.data.tabular_view], {
        type: "text/html",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timetable-${id}.html`;
      a.click();
    } catch (error) {
      toast.error("Failed to download timetable");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Timetable Management</CardTitle>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Generate New
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Generation Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timetables.map((timetable: Timetable) => (
                <TableRow key={timetable._id}>
                  <TableCell>{timetable.department}</TableCell>
                  <TableCell>{timetable.semester}</TableCell>
                  <TableCell>
                    {new Date(timetable.generation_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {timetable.isActive ? "Active" : "Inactive"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTimetable(timetable._id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TimetableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleGenerateTimetable}
        loading={loading}
      />
    </div>
  );
}
