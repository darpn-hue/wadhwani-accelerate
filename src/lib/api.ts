import { supabase } from './supabase';

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
    // ============ AUTH ENDPOINTS ============

    async signup(data: SignupData) {
        const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    full_name: data.full_name,
                    role: data.role || 'entrepreneur',
                },
            },
        });

        if (error) throw error;
        return { user: authData.user, session: authData.session };
    }

    async login(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return { user: data.user, session: data.session };
    }

    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }

    async getMe() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        // Return structured as profile for backward compatibility
        return {
            profile: {
                id: user?.id,
                email: user?.email,
                full_name: user?.user_metadata?.full_name,
                role: user?.user_metadata?.role
            }
        };
    }

    // ============ VENTURE ENDPOINTS ============

    async getVentures(params: VentureQueryParams = {}) {
        let query = supabase
            .from('ventures')
            .select('*', { count: 'exact' });

        if (params.status) {
            query = query.eq('status', params.status);
        }
        if (params.program) {
            query = query.eq('program', params.program);
        }
        if (params.limit) {
            query = query.limit(params.limit);
        }
        if (params.offset) {
            query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return { ventures: data, total: count };
    }

    async createVenture(data: any) {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const ventureData = {
            ...data,
            user_id: user.id,
            status: 'draft' // Default status
        };

        const { data: venture, error } = await supabase
            .from('ventures')
            .insert(ventureData)
            .select()
            .single();

        if (error) throw error;
        return { venture };
    }

    async getVenture(id: string) {
        const { data, error } = await supabase
            .from('ventures')
            .select(`
                *,
                streams:venture_streams(*)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        // Return streams and other data as top-level properties to match component expectations
        return {
            venture: data,
            streams: data.streams || [],
            milestones: [], // Mock or add fetch if table exists
            support_hours: {} // Mock or add fetch if table exists
        };
    }

    async updateVenture(id: string, data: any) {
        const { data: venture, error } = await supabase
            .from('ventures')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { venture };
    }

    // ============ STREAM ENDPOINTS ============

    async getVentureStreams(ventureId: string) {
        const { data, error } = await supabase
            .from('venture_streams')
            .select('*')
            .eq('venture_id', ventureId);

        if (error) throw error;
        return { streams: data };
    }

    async createStream(ventureId: string, data: { stream_name: string; status: string }) {
        const { data: stream, error } = await supabase
            .from('venture_streams')
            .insert({ ...data, venture_id: ventureId })
            .select()
            .single();

        if (error) throw error;
        return { stream };
    }

    async updateStream(id: string, data: { stream_name?: string; status?: string }) {
        const { data: stream, error } = await supabase
            .from('venture_streams')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { stream };
    }

    async deleteStream(id: string) {
        const { error } = await supabase
            .from('venture_streams')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async submitVenture(id: string) {
        const { data, error } = await supabase
            .from('ventures')
            .update({ status: 'Submitted' })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { venture: data };
    }
}

export const api = new ApiClient();
