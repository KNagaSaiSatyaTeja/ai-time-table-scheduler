export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  phone?: string;
  expertise: string[];
  createdAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  department: string;
  description?: string;
  facultyId?: string;
  createdAt: Date;
}

export interface Break {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  type: 'short' | 'lunch' | 'long';
  description?: string;
  createdAt: Date;
}

export interface TimetableEntry {
  id: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  subjectId: string;
  facultyId: string;
  type: 'lecture' | 'lab' | 'tutorial';
  createdAt: Date;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  createdBy: string;
  createdAt: Date;
  faculty: Faculty[];
  subjects: Subject[];
  breaks: Break[];
  timetable: TimetableEntry[];
}