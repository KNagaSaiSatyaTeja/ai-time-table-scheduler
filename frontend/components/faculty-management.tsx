"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Room, Faculty } from '@/types';
import { Plus, Edit, Trash2, Mail, Phone, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FacultyManagementProps {
  room: Room;
  isAdmin: boolean;
}

export default function FacultyManagement({ room, isAdmin }: FacultyManagementProps) {
  const { toast } = useToast();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  useEffect(() => {
    // Load mock faculty data
    const mockFaculty: Faculty[] = [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        department: 'Computer Science',
        phone: '+1 (555) 123-4567',
        expertise: ['Machine Learning', 'Data Science', 'Python'],
        createdAt: new Date('2024-01-10')
      },
      {
        id: '2',
        name: 'Prof. Michael Chen',
        email: 'michael.chen@university.edu',
        department: 'Mathematics',
        phone: '+1 (555) 234-5678',
        expertise: ['Calculus', 'Linear Algebra', 'Statistics'],
        createdAt: new Date('2024-01-08')
      }
    ];
    setFaculty(mockFaculty);
  }, []);

  const handleCreateFaculty = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const department = formData.get('department') as string;
    const phone = formData.get('phone') as string;
    const expertiseStr = formData.get('expertise') as string;
    const expertise = expertiseStr.split(',').map(e => e.trim()).filter(e => e);

    const newFaculty: Faculty = {
      id: Date.now().toString(),
      name,
      email,
      department,
      phone: phone || undefined,
      expertise,
      createdAt: new Date()
    };

    setFaculty([...faculty, newFaculty]);
    setIsCreateDialogOpen(false);
    toast({
      title: "Faculty added",
      description: `${name} has been added successfully.`,
    });
  };

  const handleEditFaculty = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingFaculty) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const department = formData.get('department') as string;
    const phone = formData.get('phone') as string;
    const expertiseStr = formData.get('expertise') as string;
    const expertise = expertiseStr.split(',').map(e => e.trim()).filter(e => e);

    const updatedFaculty = {
      ...editingFaculty,
      name,
      email,
      department,
      phone: phone || undefined,
      expertise
    };

    setFaculty(faculty.map(f => f.id === editingFaculty.id ? updatedFaculty : f));
    setEditingFaculty(null);
    toast({
      title: "Faculty updated",
      description: `${name} has been updated successfully.`,
    });
  };

  const handleDeleteFaculty = (facultyId: string) => {
    const facultyToDelete = faculty.find(f => f.id === facultyId);
    setFaculty(faculty.filter(f => f.id !== facultyId));
    toast({
      title: "Faculty removed",
      description: `${facultyToDelete?.name} has been removed.`,
    });
  };

  const FacultyForm = ({ faculty: editFaculty, onSubmit }: { faculty?: Faculty; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter full name"
            defaultValue={editFaculty?.name}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter email"
            defaultValue={editFaculty?.email}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            placeholder="Enter department"
            defaultValue={editFaculty?.department}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="Enter phone number"
            defaultValue={editFaculty?.phone}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="expertise">Expertise (comma-separated)</Label>
        <Textarea
          id="expertise"
          name="expertise"
          placeholder="e.g., Machine Learning, Data Science, Python"
          defaultValue={editFaculty?.expertise.join(', ')}
          className="resize-none"
        />
      </div>
      <Button type="submit" className="w-full">
        {editFaculty ? 'Update Faculty' : 'Add Faculty'}
      </Button>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Faculty Management</h3>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage faculty members for this room' : 'View faculty members'}
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Faculty
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Faculty</DialogTitle>
                <DialogDescription>
                  Add a new faculty member to this room.
                </DialogDescription>
              </DialogHeader>
              <FacultyForm onSubmit={handleCreateFaculty} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {faculty.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>{member.department}</CardDescription>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingFaculty(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFaculty(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{member.phone}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Expertise:</p>
                <div className="flex flex-wrap gap-1">
                  {member.expertise.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {faculty.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No faculty members</h3>
          <p className="text-muted-foreground mb-4">
            {isAdmin ? 'Add faculty members to get started.' : 'No faculty members assigned to this room.'}
          </p>
        </div>
      )}

      {editingFaculty && (
        <Dialog open={!!editingFaculty} onOpenChange={() => setEditingFaculty(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Faculty</DialogTitle>
              <DialogDescription>
                Update faculty member information.
              </DialogDescription>
            </DialogHeader>
            <FacultyForm faculty={editingFaculty} onSubmit={handleEditFaculty} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}