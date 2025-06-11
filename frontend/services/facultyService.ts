import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface TimeSlot {
    day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    startTime: string;
    endTime: string;
}

export interface Faculty {
    id: string;
    name: string;
    email?: string;
    department?: string;
    availability: TimeSlot[];
    isActive?: boolean;
}

export interface FacultyResponse {
    faculty: Faculty[];
    totalPages: number;
    currentPage: number;
    total: number;
}

export interface FacultyFormData {
    id: string;
    name: string;
    email?: string;
    department?: string;
    availability: TimeSlot[];
}

export const facultyService = {
    async getFaculties(page = 1, limit = 10, search?: string, department?: string, isActive?: boolean): Promise<FacultyResponse> {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search }),
                ...(department && { department }),
                ...(isActive !== undefined && { isActive: isActive.toString() })
            });

            const response = await axios.get<FacultyResponse>(`${API_URL}/faculty?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching faculties:', error);
            throw error;
        }
    },

    async getFacultyById(id: string): Promise<Faculty> {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get<Faculty>(`${API_URL}/faculty/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching faculty:', error);
            throw error;
        }
    },

    async createFaculty(facultyData: FacultyFormData): Promise<Faculty> {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post<{ message: string; faculty: Faculty }>(
                `${API_URL}/faculty`,
                facultyData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.faculty;
        } catch (error) {
            console.error('Error creating faculty:', error);
            throw error;
        }
    },

    async updateFaculty(id: string, facultyData: Partial<FacultyFormData>): Promise<Faculty> {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put<{ message: string; faculty: Faculty }>(
                `${API_URL}/faculty/${id}`,
                facultyData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.faculty;
        } catch (error) {
            console.error('Error updating faculty:', error);
            throw error;
        }
    },

    async deleteFaculty(id: string): Promise<void> {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/faculty/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Error deleting faculty:', error);
            throw error;
        }
    },

    async getFacultyAvailability(id: string): Promise<{ faculty: { id: string; name: string }; availability: TimeSlot[] }> {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get<{ faculty: { id: string; name: string }; availability: TimeSlot[] }>(
                `${API_URL}/faculty/${id}/availability`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching faculty availability:', error);
            throw error;
        }
    }
}; 