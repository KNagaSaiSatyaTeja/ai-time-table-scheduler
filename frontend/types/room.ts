export interface Room {
  _id: string;
  name: string;
  building: string;
  capacity: number;
  subjects: Subject[];
  faculty: Faculty[];
  year: number;
  department: string; // Corrected spelling from 'depertment' to 'department'
  code: string;
  semester: 1 | 2;
  createdAt: string;
  updatedAt: string;
}

interface Subject {
  id: any;
  _id: string;
  name: string;
  code: string;
}

export interface Faculty {
  _id: string;
  name: string;
  department: string;
  availability: TimeSlot[];
}

export interface TimeSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
}