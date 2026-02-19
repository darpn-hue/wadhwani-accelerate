
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createScreeningManager() {
    const email = 'rajesh@wadhwani.com';
    const password = 'password';
    const role = 'success_mgr'; // Mapping 'Screening Manager' to 'success_mgr' based on established patterns

    console.log(`Creating Screening Manager: ${email}...`);

    try {
        // 1. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: 'Rajesh (Screening Mgr)',
                    role: role
                }
            }
        });

        if (authError) {
            console.log(`Auth User creation info: ${authError.message}`);
            // If user exists, we might need to fetch their ID to ensure profile exists
            if (authError.message.includes('already registered')) {
                // Try to sign in to get the ID, or just ignore if we assume profile exists.
                // Better to just warn.
            }
        }

        let userId;
        if (authData.user) {
            userId = authData.user.id;
            console.log(`Auth User created/found with ID: ${userId}`);
        } else {
            console.log("Could not get new user ID, attempting to sign in to retrieve...");
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (signInError) {
                console.error("Could not sign in either:", signInError.message);
                return;
            }
            userId = signInData.user.id;
        }

        // 2. Ensure Profile Exists with Correct Role
        if (userId) {
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    full_name: 'Rajesh (Screening Mgr)',
                    role: role,
                    avatar_url: null,
                    updated_at: new Date().toISOString()
                });

            if (profileError) {
                console.error('Error creating/updating profile:', profileError.message);
            } else {
                console.log('Profile configured successfully as success_mgr.');
            }
        }

    } catch (err: any) {
        console.error('Unexpected error:', err.message);
    }
}

createScreeningManager();
