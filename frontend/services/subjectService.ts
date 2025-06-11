import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Subject {
    id: string;
    name: string;
    code?: string;
    duration: number;
    time: number;
    no_of_classes_per_week: number;
    faculty: string[];
    type?: 'theory' | 'practical' | 'lab' | 'tutorial';
    credits?: number;
    isActive?: boolean;
}

export interface SubjectResponse {
    subjects: Subject[];
    totalPages: number;
    currentPage: number;
    total: number;
}

export interface SubjectFormData {
    name: string;
    code?: string;
    duration: number;
    time: number;
    no_of_classes_per_week: number;
    faculty: string[];
    type?: 'theory' | 'practical' | 'lab' | 'tutorial';
    credits?: number;
}

export const subjectService = {
    async getSubjects(page = 1, limit = 10, search?: string, type?: string, isActive?: boolean): Promise<SubjectResponse> {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search }),
                ...(type && { type }),
                ...(isActive !== undefined && { isActive: isActive.toString() })
            });

            const response = await axios.get<SubjectResponse>(`${API_URL}/subjects?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching subjects:', error);
            throw error;
        }
    },

    async getSubjectById(id: string): Promise<Subject> {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get<Subject>(`${API_URL}/subjects/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching subject:', error);
            throw error;
        }
    },

    async createSubject(subjectData: SubjectFormData): Promise<Subject> {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post<{ message: string; subject: Subject }>(
                `${API_URL}/subjects`,
                subjectData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.subject;
        } catch (error) {
            console.error('Error creating subject:', error);
            throw error;
        }
    },

    async updateSubject(id: string, subjectData: Partial<SubjectFormData>): Promise<Subject> {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put<{ message: string; subject: Subject }>(
                `${API_URL}/subjects/${id}`,
                subjectData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.subject;
        } catch (error) {
            console.error('Error updating subject:', error);
            throw error;
        }
    },

    async deleteSubject(id: string): Promise<void> {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/subjects/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Error deleting subject:', error);
            throw error;
        }
    }
}; 