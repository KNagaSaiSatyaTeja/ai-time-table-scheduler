"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Room, Subject, Faculty } from '@/types';
import { Plus, Edit, Trash2, BookOpen, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubjectManagementProps {
  room: Room;
  isAdmin: boolean;
}

export default function SubjectManagement({ room, isAdmin }: SubjectManagementProps) {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  useEffect(() => {
    // Load mock data
    const mockSubjects: Subject[] = [
      {
        id: '1',
        name: 'Data Structures and Algorithms',
        code: 'CS201',
        credits: 4,
        department: 'Computer Science',
        description: 'Introduction to fundamental data structures and algorithms',
        facultyId: '1',
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Calculus I',
        code: 'MATH101',
        credits: 3,
        department: 'Mathematics',
        description: 'Differential and integral calculus',
        facultyId: '2',
        createdAt: new Date('2024-01-10')
      }
    ];

    const mockFaculty: Faculty[] = [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        department: 'Computer Science',
        expertise: ['Machine Learning', 'Data Science'],
        createdAt: new Date()
      },
      {
        id: '2',
        name: 'Prof. Michael Chen',
        email: 'michael.chen@university.edu',
        department: 'Mathematics',
        expertise: ['Calculus', 'Linear Algebra'],
        createdAt: new Date()
      }
    ];

    setSubjects(mockSubjects);
    setFaculty(mockFaculty);
  }, []);

  const handleCreateSubject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const code = formData.get('code') as string;
    const credits = parseInt(formData.get('credits') as string);
    const department = formData.get('department') as string;
    const description = formData.get('description') as string;
    const facultyId = formData.get('facultyId') as string;

    const newSubject: Subject = {
      id: Date.now().toString(),
      name,
      code,
      credits,
      department,
      description: description || undefined,
      facultyId: facultyId || undefined,
      createdAt: new Date()
    };

    setSubjects([...subjects, newSubject]);
    setIsCreateDialogOpen(false);
    toast({
      title: "Subject added",
      description: `${name} (${code}) has been added successfully.`,
    });
  };

  const handleEditSubject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSubject) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const code = formData.get('code') as string;
    const credits = parseInt(formData.get('credits') as string);
    const department = formData.get('department') as string;
    const description = formData.get('description') as string;
    const facultyId = formData.get('facultyId') as string;

    const updatedSubject = {
      ...editingSubject,
      name,
      code,
      credits,
      department,
      description: description || undefined,
      facultyId: facultyId || undefined
    };

    setSubjects(subjects.map(s => s.id === editingSubject.id ? updatedSubject : s));
    setEditingSubject(null);
    toast({
      title: "Subject updated",
      description: `${name} has been updated successfully.`,
    });
  };

  const handleDeleteSubject = (subjectId: string) => {
    const subjectToDelete = subjects.find(s => s.id === subjectId);
    setSubjects(subjects.filter(s => s.id !== subjectId));
    toast({
      title: "Subject removed",
      description: `${subjectToDelete?.name} has been removed.`,
    });
  };

  const getFacultyName = (facultyId?: string) => {
    const facultyMember = faculty.find(f => f.id === facultyId);
    return facultyMember?.name || 'Unassigned';
  };

  const SubjectForm = ({ subject: editSubject, onSubmit }: { subject?: Subject; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Subject Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter subject name"
            defaultValue={editSubject?.name}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Subject Code</Label>
          <Input
            id="code"
            name="code"
            placeholder="e.g., CS201"
            defaultValue={editSubject?.code}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="credits">Credits</Label>
          <Input
            id="credits"
            name="credits"
            type="number"
            min="1"
            max="10"
            placeholder="Enter credits"
            defaultValue={editSubject?.credits}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            placeholder="Enter department"
            defaultValue={editSubject?.department}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="facultyId">Assigned Faculty</Label>
        <Select name="facultyId" defaultValue={editSubject?.facultyId}>
          <SelectTrigger>
            <SelectValue placeholder="Select faculty member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Unassigned</SelectItem>
            {faculty.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Enter subject description"
          defaultValue={editSubject?.description}
          className="resize-none"
        />
      </div>
      <Button type="submit" className="w-full">
        {editSubject ? 'Update Subject' : 'Add Subject'}
      </Button>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Subject Management</h3>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage subjects and course offerings' : 'View available subjects'}
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
                <DialogDescription>
                  Add a new subject to the curriculum.
                </DialogDescription>
              </DialogHeader>
              <SubjectForm onSubmit={handleCreateSubject} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card key={subject.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                    <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                    <CardDescription>{subject.code}</CardDescription>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSubject(subject)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSubject(subject.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950">
                  {subject.credits} Credits
                </Badge>
                <span className="text-sm text-muted-foreground">{subject.department}</span>
              </div>
              {subject.description && (
                <p className="text-sm text-muted-foreground">{subject.description}</p>
              )}
              <div className="flex items-center space-x-2 text-sm">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Faculty: {getFacultyName(subject.facultyId)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {subjects.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No subjects</h3>
          <p className="text-muted-foreground mb-4">
            {isAdmin ? 'Add subjects to get started.' : 'No subjects available for this room.'}
          </p>
        </div>
      )}

      {editingSubject && (
        <Dialog open={!!editingSubject} onOpenChange={() => setEditingSubject(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Subject</DialogTitle>
              <DialogDescription>
                Update subject information.
              </DialogDescription>
            </DialogHeader>
            <SubjectForm subject={editingSubject} onSubmit={handleEditSubject} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}