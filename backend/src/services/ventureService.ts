import { SupabaseClient } from '@supabase/supabase-js';
import {
    Venture,
    VentureStream,
    CreateVentureRequest,
    UpdateVentureRequest,
    CreateStreamRequest,
    VentureQueryParams
} from '../types';

/**
 * Get all ventures for a user (with optional filters)
 */
export async function getVentures(
    client: SupabaseClient,
    userId: string,
    userRole: string,
    filters?: VentureQueryParams
) {
    let query = client.from('ventures').select('*', { count: 'exact' });

    // Entrepreneurs can only see their own ventures
    if (userRole === 'entrepreneur') {
        query = query.eq('user_id', userId);
    }
    // VSM and committee can see all ventures

    // Apply filters
    if (filters?.status) {
        query = query.eq('status', filters.status);
    }
    if (filters?.program) {
        query = query.eq('program', filters.program);
    }

    // Pagination
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Order by created_at desc
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    return {
        ventures: data || [],
        total: count || 0,
    };
}

/**
 * Get a single venture by ID
 */
export async function getVentureById(
    client: SupabaseClient,
    ventureId: string,
    userId: string,
    userRole: string
) {
    const { data: venture, error } = await client
        .from('ventures')
        .select('*')
        .eq('id', ventureId)
        .single();

    if (error) throw error;
    if (!venture) throw new Error('Venture not found');

    // Check permissions
    if (userRole === 'entrepreneur' && venture.user_id !== userId) {
        throw new Error('Unauthorized access to venture');
    }

    // Get streams
    const { data: streams } = await client
        .from('venture_streams')
        .select('*')
        .eq('venture_id', ventureId);

    // Get milestones
    const { data: milestones } = await client
        .from('venture_milestones')
        .select('*')
        .eq('venture_id', ventureId);

    // Get support hours
    const { data: supportHours } = await client
        .from('support_hours')
        .select('*')
        .eq('venture_id', ventureId)
        .single();

    return {
        venture,
        streams: streams || [],
        milestones: milestones || [],
        support_hours: supportHours || null,
    };
}

/**
 * Create a new venture
 */
export async function createVenture(
    client: SupabaseClient,
    userId: string,
    data: CreateVentureRequest
): Promise<Venture> {
    const { data: venture, error } = await client
        .from('ventures')
        .insert({
            user_id: userId,
            ...data,
            status: 'draft',
        })
        .select()
        .single();

    if (error) throw error;
    return venture;
}

/**
 * Update a venture
 */
export async function updateVenture(
    client: SupabaseClient,
    ventureId: string,
    userId: string,
    userRole: string,
    data: UpdateVentureRequest
): Promise<Venture> {
    // Get venture first to check permissions
    const { data: existingVenture, error: fetchError } = await client
        .from('ventures')
        .select('*')
        .eq('id', ventureId)
        .single();

    if (fetchError) throw fetchError;
    if (!existingVenture) throw new Error('Venture not found');

    // Check permissions
    if (userRole === 'entrepreneur' && existingVenture.user_id !== userId) {
        throw new Error('Unauthorized to update this venture');
    }

    // Entrepreneurs can't change status directly (except submit)
    if (userRole === 'entrepreneur' && data.status && data.status !== 'submitted') {
        delete data.status;
    }

    const { data: venture, error } = await client
        .from('ventures')
        .update(data)
        .eq('id', ventureId)
        .select()
        .single();

    if (error) throw error;
    return venture;
}

/**
 * Delete a venture
 */
export async function deleteVenture(
    client: SupabaseClient,
    ventureId: string,
    userId: string,
    userRole: string
): Promise<void> {
    // Get venture first to check permissions
    const { data: existingVenture, error: fetchError } = await client
        .from('ventures')
        .select('*')
        .eq('id', ventureId)
        .single();

    if (fetchError) throw fetchError;
    if (!existingVenture) throw new Error('Venture not found');

    // Only entrepreneurs can delete their own ventures, or admins
    if (userRole === 'entrepreneur' && existingVenture.user_id !== userId) {
        throw new Error('Unauthorized to delete this venture');
    }
    if (userRole !== 'entrepreneur' && userRole !== 'admin') {
        throw new Error('Only entrepreneurs can delete their ventures');
    }

    const { error } = await client
        .from('ventures')
        .delete()
        .eq('id', ventureId);

    if (error) throw error;
}

/**
 * Submit a venture for review
 */
export async function submitVenture(
    client: SupabaseClient,
    ventureId: string,
    userId: string
): Promise<Venture> {
    return updateVenture(client, ventureId, userId, 'entrepreneur', { status: 'submitted' });
}

// ============ STREAM OPERATIONS ============

/**
 * Get streams for a venture
 */
export async function getVentureStreams(client: SupabaseClient, ventureId: string): Promise<VentureStream[]> {
    const { data, error } = await client
        .from('venture_streams')
        .select('*')
        .eq('venture_id', ventureId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Create a stream for a venture
 */
export async function createStream(
    client: SupabaseClient,
    ventureId: string,
    data: CreateStreamRequest
): Promise<VentureStream> {
    const { data: stream, error } = await client
        .from('venture_streams')
        .insert({
            venture_id: ventureId,
            ...data,
        })
        .select()
        .single();

    if (error) throw error;
    return stream;
}

/**
 * Update a stream
 */
export async function updateStream(
    client: SupabaseClient,
    streamId: string,
    data: Partial<CreateStreamRequest>
): Promise<VentureStream> {
    const { data: stream, error } = await client
        .from('venture_streams')
        .update(data)
        .eq('id', streamId)
        .select()
        .single();

    if (error) throw error;
    return stream;
}

/**
 * Delete a stream
 */
export async function deleteStream(client: SupabaseClient, streamId: string): Promise<void> {
    const { error } = await client
        .from('venture_streams')
        .delete()
        .eq('id', streamId);

    if (error) throw error;
}
