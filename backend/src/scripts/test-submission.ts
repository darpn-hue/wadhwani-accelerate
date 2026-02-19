
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

async function simulateSubmission() {
    console.log('--- Simulating Application Submission ---');

    try {
        // 1. Authenticate as Test User
        console.log('Authenticating as vipul@wadhwani.com...');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'vipul@wadhwani.com',
            password: 'password'
        });

        if (authError || !authData.user) {
            console.error('Auth failed:', authError?.message);
            process.exit(1);
        }

        const userId = authData.user.id;
        console.log('Authenticated User ID:', userId);

        // 2. Create Venture (Mimic NewApplication.tsx)
        console.log('Creating Venture...');
        const ventureData = {
            user_id: userId,
            name: 'Test Venture Inc.',
            founder_name: 'Vipul Pandey',
            program: 'Accelerate',
            growth_current: {
                product: 'Test Product',
                city: 'Bangalore',
                state: 'Karnataka'
            },
            growth_focus: 'product,segment',
            commitment: {
                investment: '5Cr-25Cr'
            },
            blockers: '',
            support_request: 'Mentorship needed',
            status: 'draft'
        };

        const { data: venture, error: ventureError } = await supabase
            .from('ventures')
            .insert(ventureData)
            .select()
            .single();

        if (ventureError) {
            console.error('Create Venture Failed:', ventureError.message);
            process.exit(1);
        }

        console.log('Venture Created:', venture.id);

        // 3. Create Streams
        console.log('Creating Streams...');
        const streams = [
            { stream_name: 'Product', status: 'No help needed' },
            { stream_name: 'GTM', status: 'Need help' }
        ];

        for (const s of streams) {
            const { error: streamError } = await supabase
                .from('venture_streams') // Testing CORRECT table name
                .insert({ ...s, venture_id: venture.id });

            if (streamError) {
                console.error(`Failed to create stream ${s.stream_name}:`, streamError.message);
                // Don't exit, try next
            } else {
                console.log(`Stream ${s.stream_name} created.`);
            }
        }

        // 4. Submit Venture (Update Status)
        console.log('Submitting Venture...');
        const { error: submitError } = await supabase
            .from('ventures')
            .update({ status: 'Submitted' })
            .eq('id', venture.id);

        if (submitError) {
            console.error('Submit Venture Failed:', submitError.message);
        } else {
            console.log('Venture Submitted Successfully.');
        }

    } catch (err: any) {
        console.error('Unexpected error:', err.message);
    }
}

simulateSubmission();
