"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Room, TimetableEntry, Subject, Faculty } from '@/types';
import { Plus, Edit, Trash2, Calendar, Clock, BookOpen, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimetableManagementProps {
  room: Room;
  isAdmin: boolean;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function TimetableManagement({ room, isAdmin }: TimetableManagementProps) {
  const { toast } = useToast();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

  useEffect(() => {
    // Load mock data
    const mockTimetable: TimetableEntry[] = [
      {
        id: '1',
        day: 'monday',
        startTime: '09:00',
        endTime: '10:30',
        subjectId: '1',
        facultyId: '1',
        type: 'lecture',
        createdAt: new Date()
      },
      {
        id: '2',
        day: 'tuesday',
        startTime: '10:00',
        endTime: '11:30',
        subjectId: '2',
        facultyId: '2',
        type: 'tutorial',
        createdAt: new Date()
      },
      {
        id: '3',
        day: 'wednesday',
        startTime: '14:00',
        endTime: '16:00',
        subjectId: '1',
        facultyId: '1',
        type: 'lab',
        createdAt: new Date()
      }
    ];

    const mockSubjects: Subject[] = [
      {
        id: '1',
        name: 'Data Structures',
        code: 'CS201',
        credits: 4,
        department: 'Computer Science',
        createdAt: new Date()
      },
      {
        id: '2',
        name: 'Calculus I',
        code: 'MATH101',
        credits: 3,
        department: 'Mathematics',
        createdAt: new Date()
      }
    ];

    const mockFaculty: Faculty[] = [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        department: 'Computer Science',
        expertise: ['Machine Learning'],
        createdAt: new Date()
      },
      {
        id: '2',
        name: 'Prof. Michael Chen',
        email: 'michael.chen@university.edu',
        department: 'Mathematics',
        expertise: ['Calculus'],
        createdAt: new Date()
      }
    ];

    setTimetable(mockTimetable);
    setSubjects(mockSubjects);
    setFaculty(mockFaculty);
  }, []);

  const handleCreateEntry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const day = formData.get('day') as typeof DAYS[number];
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    const subjectId = formData.get('subjectId') as string;
    const facultyId = formData.get('facultyId') as string;
    const type = formData.get('type') as 'lecture' | 'lab' | 'tutorial';

    const newEntry: TimetableEntry = {
      id: Date.now().toString(),
      day,
      startTime,
      endTime,
      subjectId,
      facultyId,
      type,
      createdAt: new Date()
    };

    setTimetable([...timetable, newEntry]);
    setIsCreateDialogOpen(false);
    toast({
      title: "Timetable entry added",
      description: `Class scheduled successfully.`,
    });
  };

  const handleEditEntry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingEntry) return;

    const formData = new FormData(e.currentTarget);
    const day = formData.get('day') as typeof DAYS[number];
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    const subjectId = formData.get('subjectId') as string;
    const facultyId = formData.get('facultyId') as string;
    const type = formData.get('type') as 'lecture' | 'lab' | 'tutorial';

    const updatedEntry = {
      ...editingEntry,
      day,
      startTime,
      endTime,
      subjectId,
      facultyId,
      type
    };

    setTimetable(timetable.map(e => e.id === editingEntry.id ? updatedEntry : e));
    setEditingEntry(null);
    toast({
      title: "Timetable entry updated",
      description: `Class updated successfully.`,
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    setTimetable(timetable.filter(e => e.id !== entryId));
    toast({
      title: "Timetable entry removed",
      description: `Class has been removed from the schedule.`,
    });
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || 'Unknown Subject';
  };

  const getFacultyName = (facultyId: string) => {
    return faculty.find(f => f.id === facultyId)?.name || 'Unknown Faculty';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'lab': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'tutorial': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const TimetableForm = ({ entry: editEntry, onSubmit }: { entry?: TimetableEntry; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="day">Day</Label>
          <Select name="day" defaultValue={editEntry?.day} required>
            <SelectTrigger>
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {DAYS.map((day) => (
                <SelectItem key={day} value={day}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select name="type" defaultValue={editEntry?.type || 'lecture'} required>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lecture">Lecture</SelectItem>
              <SelectItem value="lab">Lab</SelectItem>
              <SelectItem value="tutorial">Tutorial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            name="startTime"
            type="time"
            defaultValue={editEntry?.startTime}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            name="endTime"
            type="time"
            defaultValue={editEntry?.endTime}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subjectId">Subject</Label>
        <Select name="subjectId" defaultValue={editEntry?.subjectId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name} ({subject.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="facultyId">Faculty</Label>
        <Select name="facultyId" defaultValue={editEntry?.facultyId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select faculty" />
          </SelectTrigger>
          <SelectContent>
            {faculty.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">
        {editEntry ? 'Update Entry' : 'Add Entry'}
      </Button>
    </form>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {timetable.map((entry) => (
        <Card key={entry.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {entry.day.charAt(0).toUpperCase() + entry.day.slice(1)}
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{entry.startTime} - {entry.endTime}</span>
                  </CardDescription>
                </div>
              </div>
              {isAdmin && (
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingEntry(entry)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEntry(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge className={getTypeColor(entry.type)}>
              {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
            </Badge>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>{getSubjectName(entry.subjectId)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{getFacultyName(entry.facultyId)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const TableView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Timetable</CardTitle>
        <CardDescription>Complete schedule overview</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Day</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Faculty</TableHead>
              <TableHead>Type</TableHead>
              {isAdmin && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {timetable.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">
                  {entry.day.charAt(0).toUpperCase() + entry.day.slice(1)}
                </TableCell>
                <TableCell>{entry.startTime} - {entry.endTime}</TableCell>
                <TableCell>{getSubjectName(entry.subjectId)}</TableCell>
                <TableCell>{getFacultyName(entry.facultyId)}</TableCell>
                <TableCell>
                  <Badge className={getTypeColor(entry.type)}>
                    {entry.type}
                  </Badge>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingEntry(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Timetable Management</h3>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage class schedules and timing' : 'View class timetable'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
          </div>
          {isAdmin && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Class</DialogTitle>
                  <DialogDescription>
                    Schedule a new class session.
                  </DialogDescription>
                </DialogHeader>
                <TimetableForm onSubmit={handleCreateEntry} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {viewMode === 'grid' ? <GridView /> : <TableView />}

      {timetable.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No classes scheduled</h3>
          <p className="text-muted-foreground mb-4">
            {isAdmin ? 'Add classes to create a timetable.' : 'No classes scheduled for this room.'}
          </p>
        </div>
      )}

      {editingEntry && (
        <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Class</DialogTitle>
              <DialogDescription>
                Update class information.
              </DialogDescription>
            </DialogHeader>
            <TimetableForm entry={editingEntry} onSubmit={handleEditEntry} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}