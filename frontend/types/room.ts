export interface Room {
  _id: string;
  number:  string; // Changed from name to number
  building: string;
  capacity: number;
  year: number;
  roomType?: string | undefined;
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

export interface FormDataType {
  number: string | number | null;  // Changed from name to number to match Room interface
  building: string;
  capacity: number;
  year: number;
  semester: number;
  subjects: string[];
  department: string;
  faculty?: string[];
  roomType: "Classroom" | "Laboratory" | "Seminar Hall" | "Conference Room";  // Made required and added more specific types
}

export interface RoomResponse {
  status: number;
  data: {
    id: string;
    createdAt: string;
    [key: string]: any;
  };
}

export type SingleRoomResponse = {
  success: boolean;
  data: Room;
  message?: string;
}