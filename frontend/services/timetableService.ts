import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface TimeSlot {
    startTime: string;
    endTime: string;
}

export interface Break {
    startTime: string;
    endTime: string;
    name: string;
}

export interface CollegeTime {
    startTime: string;
    endTime: string;
}

export interface Faculty {
    id: string;
    name: string;
}

export interface Subject {
    name: string;
    duration: number;
    time: number;
    no_of_classes_per_week: number;
    faculty: string[];
}

export interface ScheduleData {
    college_time: CollegeTime;
    rooms: string[];
    subjects: Subject[];
    department?: string;
    semester?: number;
    break_?: Break[];
    academic_year?: number;
}

export interface Class {
    subject: string;
    faculty: {
        id: string;
        name: string;
    };
    day: string;
    startTime: string;
    endTime: string;
    room: string;
    duration: number;
    isSpecial: boolean;
}

export interface TimetableStatistics {
    fitness: number;
    preference_score: number;
    break_slots: number;
    total_assignments: number;
    total_available_slots: number;
    utilization_percentage: number;
}

export interface Timetable {
    id: string;
    schedule: string;
    classes: Class[];
    timeSlots: TimeSlot[];
    generation_date: string;
    academic_year: number;
    semester: number;
    department: string;
    isActive: boolean;
    statistics: TimetableStatistics;
}

export interface TimetableResponse {
    timetables: Timetable[];
    totalPages: number;
    currentPage: number;
    total: number;
}

export interface GenerateTimetableResponse {
    timetable: Timetable;
    statistics: TimetableStatistics;
    tabular_view: string;
}

export const timetableService = {
    async generateTimetable(scheduleData: ScheduleData): Promise<GenerateTimetableResponse> {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post<GenerateTimetableResponse>(
                `${API_URL}/timetable/generate`,
                scheduleData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error generating timetable:', error);
            throw error;
        }
    },

    async getTimetables(
        page = 1,
        limit = 10,
        academic_year?: number,
        semester?: number,
        department?: string,
        isActive?: boolean
    ): Promise<TimetableResponse> {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(academic_year && { academic_year: academic_year.toString() }),
                ...(semester && { semester: semester.toString() }),
                ...(department && { department }),
                ...(isActive !== undefined && { isActive: isActive.toString() })
            });

            const response = await axios.get<TimetableResponse>(`${API_URL}/timetable?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching timetables:', error);
            throw error;
        }
    },

    async getTimetableById(id: string): Promise<Timetable> {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get<Timetable>(`${API_URL}/timetable/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching timetable:', error);
            throw error;
        }
    },

    async deleteTimetable(id: string): Promise<void> {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/timetable/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Error deleting timetable:', error);
            throw error;
        }
    }
}; 