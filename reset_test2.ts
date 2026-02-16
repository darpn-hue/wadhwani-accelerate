
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function reset() {
    console.log('Authenticating...');
    const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'committee@admin.com',
        password: 'admin123'
    });
    if (authError) { console.error(authError); return; }

    console.log('Resetting Test2...');
    const { error } = await supabase
        .from('ventures')
        .update({
            status: 'Submitted',
            venture_partner: null,
            agreement_milestones: null,
            program_recommendation: 'Accelerate Core'
        })
        .eq('name', 'Test2');

    if (error) console.error(error);
    else console.log('Reset complete.');
}

reset();
