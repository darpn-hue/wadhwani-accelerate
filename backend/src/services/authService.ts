import { supabase } from '../config/supabase';
import { SignupRequest, LoginRequest, AuthResponse } from '../types';

/**
 * Register a new user
 */
export async function signup(data: SignupRequest): Promise<AuthResponse> {
    const { email, password, full_name, role } = data;

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name,
                role: role || 'entrepreneur',
            },
        },
    });

    if (authError) throw authError;
    if (!authData.user || !authData.session) {
        throw new Error('Signup failed');
    }

    // Create profile in profiles table
    const { error: profileError } = await supabase
        .from('profiles')
        .insert({
            id: authData.user.id,
            email,
            full_name,
            role: role || 'entrepreneur',
        });

    if (profileError) {
        // If profile creation fails, we should ideally rollback the auth user
        // For now, just log the error
        console.error('Profile creation error:', profileError);
    }

    return {
        user: authData.user,
        session: {
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
            expires_in: authData.session.expires_in,
        },
    };
}

/**
 * Login user
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    if (!authData.user || !authData.session) {
        throw new Error('Login failed');
    }

    return {
        user: authData.user,
        session: {
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
            expires_in: authData.session.expires_in,
        },
    };
}

/**
 * Logout user
 */
export async function logout(accessToken: string): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
    });

    if (error) throw error;
    if (!data.user || !data.session) {
        throw new Error('Token refresh failed');
    }

    return {
        user: data.user,
        session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_in: data.session.expires_in,
        },
    };
}
