"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Plus,
  Search,
  Users,
  Clock,
  BookOpen,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { roomService, Room } from "@/services/roomService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoomListProps {
  onRoomSelect: (room: Room) => void;
}

export default function RoomList({ onRoomSelect }: RoomListProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setIsLoading(true);
      const response = await roomService.getRooms();
      setRooms(response.rooms);
    } catch (error) {
      console.error("Error loading rooms:", error);
      toast({
        title: "Error Loading Rooms",
        description: "Failed to load rooms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.currentTarget);
      const number = formData.get("number") as string;
      const type = formData.get("type") as "classroom" | "laboratory";
      const capacity = parseInt(formData.get("capacity") as string);

      // Validate form data
      if (!number || !type || !capacity) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all fields before creating a room.",
          variant: "destructive",
        });
        return;
      }

      if (capacity <= 0) {
        toast({
          title: "Invalid Capacity",
          description: "Capacity must be a positive number.",
          variant: "destructive",
        });
        return;
      }

      const newRoom = await roomService.createRoom({
        number,
        type,
        capacity,
      });

      setRooms([...rooms, newRoom]);
      setIsCreateDialogOpen(false);
      toast({
        title: "Room Created",
        description: `The room "${number}" has been created successfully.`,
      });
    } catch (error: any) {
      console.error("Room creation error:", error);
      toast({
        title: "Error Creating Room",
        description:
          error.response?.data?.message ||
          "Failed to create room. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredRooms = rooms.filter(
    (room) =>
      String(room.number).toLowerCase().includes(searchQuery.toLowerCase())
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
            {user?.role === "admin" && (
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
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
                      Add a new room to your educational space
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateRoom} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="number">Room Number</Label>
                      <Input
                        id="number"
                        name="number"
                        placeholder="Enter room number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Room Type</Label>
                      <Select name="type" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="classroom">Classroom</SelectItem>
                          <SelectItem value="laboratory">Laboratory</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        name="capacity"
                        type="number"
                        min="1"
                        placeholder="Enter room capacity"
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div>Loading rooms...</div>
          ) : filteredRooms.length === 0 ? (
            <div>No rooms found</div>
          ) : (
            filteredRooms.map((room) => (
              <Card
                key={room._id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onRoomSelect(room)}
              >
                <CardHeader>
                  <CardTitle>Room {room.number}</CardTitle>
                  <CardDescription>
                    {room.roomType === "laboratory" ? "Laboratory" : "Classroom"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      Capacity: {room.capacity || "N/A"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
