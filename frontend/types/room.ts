export interface Room {
  _id: string;
  name: string;
  building: string;
  capacity: number;
  subjects: Subject[];
  faculty: Faculty[];
  year: number;
  department: string; // Corrected spelling from 'depertment' to 'department'

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

interface Faculty {
  _id: string;
  name: string;
  department: string;
}