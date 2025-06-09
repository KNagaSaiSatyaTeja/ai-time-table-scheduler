"use client";

import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import FacultyManagement from '@/components/faculty-management';
import SubjectManagement from '@/components/subject-management';
import BreakManagement from '@/components/break-management';
import TimetableManagement from '@/components/timetable-management';
import { Room } from '@/types';
import { ArrowLeft, Users, BookOpen, Coffee, Calendar, GraduationCap, LogOut } from 'lucide-react';

interface RoomViewProps {
  room: Room;
  onBack: () => void;
}

export default function RoomView({ room, onBack }: RoomViewProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('faculty');

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Rooms
              </Button>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{room.name}</h1>
                  <p className="text-sm text-muted-foreground">{room.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Capacity: {room.capacity} | {user?.role}
              </div>
              <ThemeToggle />
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faculty" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Faculty</span>
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Subjects</span>
            </TabsTrigger>
            <TabsTrigger value="breaks" className="flex items-center space-x-2">
              <Coffee className="h-4 w-4" />
              <span>Breaks</span>
            </TabsTrigger>
            <TabsTrigger value="timetable" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Timetable</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faculty" className="mt-6">
            <FacultyManagement room={room} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="subjects" className="mt-6">
            <SubjectManagement room={room} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="breaks" className="mt-6">
            <BreakManagement room={room} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="timetable" className="mt-6">
            <TimetableManagement room={room} isAdmin={isAdmin} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}