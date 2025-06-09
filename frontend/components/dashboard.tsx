"use client";

import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import RoomList from '@/components/room-list';
import RoomView from '@/components/room-view';
import { Room } from '@/types';

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  if (selectedRoom) {
    return (
      <RoomView 
        room={selectedRoom} 
        onBack={() => setSelectedRoom(null)} 
      />
    );
  }

  return (
    <RoomList 
      onRoomSelect={setSelectedRoom}
    />
  );
}