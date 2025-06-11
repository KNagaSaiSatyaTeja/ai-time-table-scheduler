"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Grid, Table as TableIcon } from "lucide-react";

interface TimeSlot {
  startTime: string;
  endTime: string;
  subject: string;
  faculty: string;
  room: string;
}

interface TimetableDay {
  date: Date;
  slots: TimeSlot[];
}

interface TimetableProps {
  timetable: TimetableDay[];
  onSlotClick?: (slot: TimeSlot) => void;
}

const timeSlots = [
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "1:00 PM - 2:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM",
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TimetableView({ timetable, onSlotClick }: TimetableProps) {
  const [view, setView] = useState<"calendar" | "grid" | "table">("grid");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const renderCalendarView = () => (
    <div className="flex gap-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="rounded-md border"
      />
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>
            {selectedDate?.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Room</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeSlots.map((slot) => {
                const schedule = timetable
                  .find((day) => day.date.toDateString() === selectedDate?.toDateString())
                  ?.slots.find((s) => s.startTime === slot.split(" - ")[0]);

                return (
                  <TableRow key={slot}>
                    <TableCell>{slot}</TableCell>
                    <TableCell>{schedule?.subject || "-"}</TableCell>
                    <TableCell>{schedule?.faculty || "-"}</TableCell>
                    <TableCell>{schedule?.room || "-"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderGridView = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            {days.map((day) => (
              <TableHead key={day}>{day}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeSlots.map((slot) => (
            <TableRow key={slot}>
              <TableCell className="font-medium">{slot}</TableCell>
              {days.map((day) => {
                const schedule = timetable
                  .find((d) => d.date.getDay() === days.indexOf(day) + 1)
                  ?.slots.find((s) => s.startTime === slot.split(" - ")[0]);

                return (
                  <TableCell
                    key={day}
                    className={`cursor-pointer hover:bg-muted ${
                      schedule ? "bg-primary/10" : ""
                    }`}
                    onClick={() => schedule && onSlotClick?.(schedule)}
                  >
                    {schedule ? (
                      <div className="space-y-1">
                        <div className="font-medium">{schedule.subject}</div>
                        <div className="text-sm text-muted-foreground">
                          {schedule.faculty}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {schedule.room}
                        </div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderTableView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Day</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Faculty</TableHead>
          <TableHead>Room</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {timetable.map((day) =>
          day.slots.map((slot, index) => (
            <TableRow
              key={`${day.date.toDateString()}-${index}`}
              className="cursor-pointer hover:bg-muted"
              onClick={() => onSlotClick?.(slot)}
            >
              <TableCell>
                {day.date.toLocaleDateString("en-US", { weekday: "long" })}
              </TableCell>
              <TableCell>{`${slot.startTime} - ${slot.endTime}`}</TableCell>
              <TableCell>{slot.subject}</TableCell>
              <TableCell>{slot.faculty}</TableCell>
              <TableCell>{slot.room}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList>
            <TabsTrigger value="calendar">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="grid">
              <Grid className="h-4 w-4 mr-2" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="table">
              <TableIcon className="h-4 w-4 mr-2" />
              Table
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <TabsContent value="calendar" className="mt-0">
        {renderCalendarView()}
      </TabsContent>
      <TabsContent value="grid" className="mt-0">
        {renderGridView()}
      </TabsContent>
      <TabsContent value="table" className="mt-0">
        {renderTableView()}
      </TabsContent>
    </div>
  );
} 