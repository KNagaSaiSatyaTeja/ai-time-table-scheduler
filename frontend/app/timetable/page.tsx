"use client";

import { useState, useEffect } from "react";
import TimetableView from "@/components/timetable-view";
import { timetableService } from "@/services/timetableService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function TimetablePage() {
  const { toast } = useToast();
  const [timetable, setTimetable] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      setIsLoading(true);
      const response = await timetableService.getTimetables();
      // Transform the data to match our component's interface
      const transformedData = response.timetables.map((timetable: any) => ({
        date: new Date(timetable.date),
        slots: timetable.slots.map((slot: any) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          subject: slot.subject.name,
          faculty: slot.faculty.name,
          room: slot.room.number,
        })),
      }));
      setTimetable(transformedData);
    } catch (error) {
      console.error("Error loading timetable:", error);
      toast({
        title: "Error Loading Timetable",
        description: "Failed to load timetable. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotClick = (slot: any) => {
    // Handle slot click - you can show details or edit the slot
    console.log("Clicked slot:", slot);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Timetable</h1>
          <p className="text-muted-foreground">
            View and manage your class schedule
          </p>
        </div>
        <Button onClick={loadTimetable}>Refresh</Button>
      </div>

      <TimetableView
        timetable={timetable}
        onSlotClick={handleSlotClick}
      />
    </div>
  );
} 