
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Verifying Tes3 Status...');

    // Auth as committee to see the data (RLS)
    const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'committee@admin.com',
        password: 'admin123'
    });
    if (authError) { console.error('Auth check failed', authError); return; }

    const { data, error } = await supabase
        .from('ventures')
        .select('name, status, internal_comments')
        .eq('name', 'Tes3')
        .single();

    if (error) console.error(error);
    else {
        console.log('\nVERIFICATION RESULT:');
        console.log(`- Name: ${data.name}`);
        console.log(`- Status: ${data.status}`);
        console.log(`- Comments: ${data.internal_comments}`);
    }
}

verify();
