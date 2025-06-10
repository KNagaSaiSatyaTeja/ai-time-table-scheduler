import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Room {
  _id: string;
  number: string;
  building: string;
  capacity: number;
  year: number;
  roomType?: string;
  semester: number;
  subjects: Array<{
    _id: string;
    name: string;
    code?: string;
    department?: string;
  }>;
  department: string;
  faculty?: Array<{
    _id: string;
    name: string;
    department?: string;
    availability?: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export interface RoomResponse {
  rooms: Room[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface RoomFormData {
  number: string;
  capacity?: number;
  type?: 'classroom' | 'laboratory' | 'auditorium' | 'seminar_hall';
}

export const roomService = {
  async getRooms(
    page = 1,
    limit = 10,
    search?: string,
    type?: string,
    building?: string,
    isActive?: boolean
  ): Promise<RoomResponse> {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(type && { type }),
        ...(building && { building }),
        ...(isActive !== undefined && { isActive: isActive.toString() })
      });

      const response = await axios.get<RoomResponse>(`${API_URL}/rooms?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  async getRoomById(id: string): Promise<Room> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<Room>(`${API_URL}/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  },

  async createRoom(roomData: RoomFormData): Promise<Room> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post<{ message: string; room: Room }>(
        `${API_URL}/rooms`,
        roomData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.room;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  async updateRoom(id: string, roomData: Partial<RoomFormData>): Promise<Room> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put<{ message: string; room: Room }>(
        `${API_URL}/rooms/${id}`,
        roomData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.room;
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  },

  async deleteRoom(id: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  }
};