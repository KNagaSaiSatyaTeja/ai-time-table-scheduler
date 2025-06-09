"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { Room } from '@/types';
import { Plus, Search, Users, Clock, BookOpen, LogOut, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RoomListProps {
  onRoomSelect: (room: Room) => void;
}

export default function RoomList({ onRoomSelect }: RoomListProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    // Load mock rooms
    const mockRooms: Room[] = [
      {
        id: '1',
        name: 'Computer Science Lab',
        description: 'Main computer lab for CS students',
        capacity: 30,
        createdBy: 'admin@example.com',
        createdAt: new Date('2024-01-15'),
        faculty: [],
        subjects: [],
        breaks: [],
        timetable: []
      },
      {
        id: '2',
        name: 'Physics Laboratory',
        description: 'Advanced physics research lab',
        capacity: 25,
        createdBy: 'admin@example.com',
        createdAt: new Date('2024-01-10'),
        faculty: [],
        subjects: [],
        breaks: [],
        timetable: []
      },
      {
        id: '3',
        name: 'Mathematics Classroom',
        description: 'Large classroom for mathematics lectures',
        capacity: 50,
        createdBy: 'admin@example.com',
        createdAt: new Date('2024-01-08'),
        faculty: [],
        subjects: [],
        breaks: [],
        timetable: []
      }
    ];
    setRooms(mockRooms);
  }, []);

  const handleCreateRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const capacity = parseInt(formData.get('capacity') as string);

    const newRoom: Room = {
      id: Date.now().toString(),
      name,
      description,
      capacity,
      createdBy: user!.email,
      createdAt: new Date(),
      faculty: [],
      subjects: [],
      breaks: [],
      timetable: []
    };

    setRooms([...rooms, newRoom]);
    setIsCreateDialogOpen(false);
    toast({
      title: "Room created",
      description: `${name} has been created successfully.`,
    });
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">EduRoom</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.name} ({user?.role})
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold">Your Rooms</h2>
              <p className="text-muted-foreground">
                Manage and access your educational spaces
              </p>
            </div>
            {user?.role === 'admin' && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Room
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Room</DialogTitle>
                    <DialogDescription>
                      Add a new room to your educational space management system.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateRoom} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Room Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter room name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        name="description"
                        placeholder="Enter room description"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        name="capacity"
                        type="number"
                        placeholder="Enter room capacity"
                        min="1"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Create Room
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <Card 
              key={room.id} 
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
              onClick={() => onRoomSelect(room)}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span>{room.name}</span>
                </CardTitle>
                <CardDescription>{room.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{room.capacity} capacity</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{room.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No rooms match your search criteria.' : 'Get started by creating your first room.'}
            </p>
            {user?.role === 'admin' && !searchQuery && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Room
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}