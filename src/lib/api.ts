const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface SignupData {
    email: string;
    password: string;
    full_name: string;
    role?: 'entrepreneur' | 'vsm' | 'committee' | 'admin';
}

interface VentureQueryParams {
    status?: string;
    program?: string;
    limit?: number;
    offset?: number;
}

class ApiClient {
    private getAuthHeader(): Record<string, string> {
        const token = localStorage.getItem('access_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeader(),
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    }

    // ============ AUTH ENDPOINTS ============

    async signup(data: SignupData) {
        return this.request<{ user: any; session: any }>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async login(email: string, password: string) {
        return this.request<{ user: any; session: any }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async logout() {
        return this.request<{ message: string }>('/auth/logout', {
            method: 'POST',
        });
    }

    async getMe() {
        return this.request<{ profile: any }>('/auth/me');
    }

    async refreshToken(refreshToken: string) {
        return this.request<{ session: any }>('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refresh_token: refreshToken }),
        });
    }

    // ============ VENTURE ENDPOINTS ============

    async getVentures(params?: VentureQueryParams) {
        const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        return this.request<{ ventures: any[]; total: number }>(`/ventures${query}`);
    }

    async createVenture(data: any) {
        return this.request<{ venture: any }>('/ventures', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getVenture(id: string) {
        return this.request<{ venture: any; streams?: any[] }>(`/ventures/${id}`);
    }

    async updateVenture(id: string, data: any) {
        return this.request<{ venture: any }>(`/ventures/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteVenture(id: string) {
        return this.request<void>(`/ventures/${id}`, {
            method: 'DELETE',
        });
    }

    async submitVenture(id: string) {
        return this.request<{ message: string; venture: any }>(`/ventures/${id}/submit`, {
            method: 'POST',
        });
    }

    // ============ STREAM ENDPOINTS ============

    async getVentureStreams(ventureId: string) {
        return this.request<{ streams: any[] }>(`/ventures/${ventureId}/streams`);
    }

    async createStream(ventureId: string, data: { stream_name: string; status: string }) {
        return this.request<{ stream: any }>(`/ventures/${ventureId}/streams`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateStream(streamId: string, data: { stream_name?: string; status?: string }) {
        return this.request<{ stream: any }>(`/streams/${streamId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteStream(streamId: string) {
        return this.request<void>(`/streams/${streamId}`, {
            method: 'DELETE',
        });
    }
}

export const api = new ApiClient();
