
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

async function resetDb() {
    console.log('Starting DB Reset (using correct schema tables)...');

    const tables = [
        'venture_history',
        'support_hours',
        'venture_streams',
        'venture_milestones',
        'ventures'
    ];

    for (const table of tables) {
        console.log(`Clearing ${table}...`);
        const { error, count } = await supabase
            .from(table)
            .delete({ count: 'exact' })
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Hack to delete all

        if (error) {
            console.error(`Error clearing ${table}:`, error.message);
        } else {
            console.log(`Cleared ${count !== null ? count : 'unknown'} rows from ${table}.`);
        }
    }

    // Create Test User
    const email = 'vipul@wadhwani.com';
    const password = 'password';

    console.log(`Ensuring user ${email} exists...`);

    // Try to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Vipul Pandey',
                role: 'admin'
            }
        }
    });

    if (signUpError) {
        console.log(`User likely matches or exists (Info: ${signUpError.message})`);
    } else if (signUpData.user) {
        console.log('User created successfully:', signUpData.user.id);
    }
}

resetDb();
