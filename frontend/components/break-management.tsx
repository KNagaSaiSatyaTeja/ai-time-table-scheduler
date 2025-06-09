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
import { Room, Break } from '@/types';
import { Plus, Edit, Trash2, Coffee, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BreakManagementProps {
  room: Room;
  isAdmin: boolean;
}

export default function BreakManagement({ room, isAdmin }: BreakManagementProps) {
  const { toast } = useToast();
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBreak, setEditingBreak] = useState<Break | null>(null);

  useEffect(() => {
    // Load mock break data
    const mockBreaks: Break[] = [
      {
        id: '1',
        name: 'Morning Break',
        startTime: '10:15',
        endTime: '10:30',
        type: 'short',
        description: 'Short refreshment break',
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Lunch Break',
        startTime: '12:30',
        endTime: '13:30',
        type: 'lunch',
        description: 'Extended lunch break',
        createdAt: new Date('2024-01-15')
      },
      {
        id: '3',
        name: 'Afternoon Break',
        startTime: '15:15',
        endTime: '15:30',
        type: 'short',
        description: 'Afternoon refreshment break',
        createdAt: new Date('2024-01-15')
      }
    ];
    setBreaks(mockBreaks);
  }, []);

  const handleCreateBreak = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    const type = formData.get('type') as 'short' | 'lunch' | 'long';
    const description = formData.get('description') as string;

    const newBreak: Break = {
      id: Date.now().toString(),
      name,
      startTime,
      endTime,
      type,
      description: description || undefined,
      createdAt: new Date()
    };

    setBreaks([...breaks, newBreak]);
    setIsCreateDialogOpen(false);
    toast({
      title: "Break added",
      description: `${name} has been added successfully.`,
    });
  };

  const handleEditBreak = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingBreak) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    const type = formData.get('type') as 'short' | 'lunch' | 'long';
    const description = formData.get('description') as string;

    const updatedBreak = {
      ...editingBreak,
      name,
      startTime,
      endTime,
      type,
      description: description || undefined
    };

    setBreaks(breaks.map(b => b.id === editingBreak.id ? updatedBreak : b));
    setEditingBreak(null);
    toast({
      title: "Break updated",
      description: `${name} has been updated successfully.`,
    });
  };

  const handleDeleteBreak = (breakId: string) => {
    const breakToDelete = breaks.find(b => b.id === breakId);
    setBreaks(breaks.filter(b => b.id !== breakId));
    toast({
      title: "Break removed",
      description: `${breakToDelete?.name} has been removed.`,
    });
  };

  const getBreakTypeColor = (type: string) => {
    switch (type) {
      case 'short': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'lunch': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'long': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const BreakForm = ({ breakItem: editBreak, onSubmit }: { breakItem?: Break; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Break Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter break name"
          defaultValue={editBreak?.name}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            name="startTime"
            type="time"
            defaultValue={editBreak?.startTime}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            name="endTime"
            type="time"
            defaultValue={editBreak?.endTime}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Break Type</Label>
        <Select name="type" defaultValue={editBreak?.type || 'short'} required>
          <SelectTrigger>
            <SelectValue placeholder="Select break type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="short">Short Break</SelectItem>
            <SelectItem value="lunch">Lunch Break</SelectItem>
            <SelectItem value="long">Long Break</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Enter break description"
          defaultValue={editBreak?.description}
          className="resize-none"
        />
      </div>
      <Button type="submit" className="w-full">
        {editBreak ? 'Update Break' : 'Add Break'}
      </Button>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Break Management</h3>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage break schedules and timing' : 'View scheduled breaks'}
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Break
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Break</DialogTitle>
                <DialogDescription>
                  Schedule a new break period.
                </DialogDescription>
              </DialogHeader>
              <BreakForm onSubmit={handleCreateBreak} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {breaks.map((breakItem) => (
          <Card key={breakItem.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
                    <Coffee className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{breakItem.name}</CardTitle>
                    <CardDescription className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{breakItem.startTime} - {breakItem.endTime}</span>
                    </CardDescription>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingBreak(breakItem)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBreak(breakItem.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge className={getBreakTypeColor(breakItem.type)}>
                {breakItem.type === 'short' ? 'Short Break' : 
                 breakItem.type === 'lunch' ? 'Lunch Break' : 'Long Break'}
              </Badge>
              {breakItem.description && (
                <p className="text-sm text-muted-foreground">{breakItem.description}</p>
              )}
              <div className="text-xs text-muted-foreground">
                Duration: {(() => {
                  const start = new Date(`2024-01-01 ${breakItem.startTime}`);
                  const end = new Date(`2024-01-01 ${breakItem.endTime}`);
                  const diff = end.getTime() - start.getTime();
                  const minutes = Math.floor(diff / 60000);
                  return `${minutes} minutes`;
                })()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {breaks.length === 0 && (
        <div className="text-center py-12">
          <Coffee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No breaks scheduled</h3>
          <p className="text-muted-foreground mb-4">
            {isAdmin ? 'Add break periods to get started.' : 'No breaks scheduled for this room.'}
          </p>
        </div>
      )}

      {editingBreak && (
        <Dialog open={!!editingBreak} onOpenChange={() => setEditingBreak(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Break</DialogTitle>
              <DialogDescription>
                Update break information.
              </DialogDescription>
            </DialogHeader>
            <BreakForm breakItem={editingBreak} onSubmit={handleEditBreak} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}