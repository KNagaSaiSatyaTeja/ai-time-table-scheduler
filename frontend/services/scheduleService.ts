import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface CollegeTime {
    startTime: string;
    endTime: string;
}

export interface Break {
    day: 'ALL_DAYS' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    startTime: string;
    endTime: string;
    name?: string;
}

export interface Schedule {
    id: string;
    college_time: CollegeTime;
    break_: Break[];
    rooms: string[];
    subjects: string[];
    academic_year: string;
    semester: string;
    department: string;
    isActive: boolean;
    createdAt: string;
}

export interface ScheduleResponse {
    schedules: Schedule[];
    totalPages: number;
    currentPage: number;
    total: number;
}

export interface ScheduleFormData {
    college_time: CollegeTime;
    break_?: Break[];
    rooms: string[];
    subjects: string[];
    academic_year?: string;
    semester: string;
    department: string;
}

export const scheduleService = {
    async getSchedules(
        page = 1,
        limit = 10,
        academic_year?: string,
        semester?: string,
        department?: string,
        isActive?: boolean
    ): Promise<ScheduleResponse> {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(academic_year && { academic_year }),
                ...(semester && { semester }),
                ...(department && { department }),
                ...(isActive !== undefined && { isActive: isActive.toString() })
            });

            const response = await axios.get<ScheduleResponse>(`${API_URL}/schedule?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching schedules:', error);
            throw error;
        }
    },

    async getScheduleById(id: string): Promise<Schedule> {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get<Schedule>(`${API_URL}/schedule/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching schedule:', error);
            throw error;
        }
    },

    async createSchedule(scheduleData: ScheduleFormData): Promise<Schedule> {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post<{ message: string; schedule: Schedule }>(
                `${API_URL}/schedule`,
                scheduleData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.schedule;
        } catch (error) {
            console.error('Error creating schedule:', error);
            throw error;
        }
    },

    async updateSchedule(id: string, scheduleData: Partial<ScheduleFormData>): Promise<Schedule> {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put<{ message: string; schedule: Schedule }>(
                `${API_URL}/schedule/${id}`,
                scheduleData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.schedule;
        } catch (error) {
            console.error('Error updating schedule:', error);
            throw error;
        }
    },

    async deleteSchedule(id: string): Promise<void> {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/schedule/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Error deleting schedule:', error);
            throw error;
        }
    },

    async createBulkSchedule(scheduleData: ScheduleFormData): Promise<Schedule> {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post<{ message: string; schedule: Schedule }>(
                `${API_URL}/schedule/bulk`,
                scheduleData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.schedule;
        } catch (error) {
            console.error('Error creating bulk schedule:', error);
            throw error;
        }
    }
}; 