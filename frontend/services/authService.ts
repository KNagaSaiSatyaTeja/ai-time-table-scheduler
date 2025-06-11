import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'faculty' | 'student';
    createdAt?: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'faculty' | 'student';
}

export interface ProfileUpdateData {
    name?: string;
}

export const authService = {
    async login(loginData: LoginData): Promise<AuthResponse> {
        try {
            const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, loginData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    },

    async register(registerData: RegisterData): Promise<AuthResponse> {
        try {
            const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, registerData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error) {
            console.error('Error during registration:', error);
            throw error;
        }
    },

    async getProfile(): Promise<User> {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get<{ user: User }>(`${API_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.user;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    },

    async updateProfile(profileData: ProfileUpdateData): Promise<User> {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put<{ message: string; user: User }>(
                `${API_URL}/auth/profile`,
                profileData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.user;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    logout(): void {
        localStorage.removeItem('token');
    },

    getToken(): string | null {
        return localStorage.getItem('token');
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}; 