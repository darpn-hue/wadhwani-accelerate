
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) { process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
    console.log('Setting up Committee Test Data...');

    // 1. Authenticate (to bypass RLS if needed for update)
    const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'meetul@admin.com',
        password: 'admin123'
    });
    if (authError) console.error('Auth failed', authError);

    // 2. Find Test2 or Create
    let { data: ventures } = await supabase.from('ventures').select('*').eq('name', 'Test2');

    let ventureId;

    if (!ventures || ventures.length === 0) {
        console.log('Creating Test2 venture...');
        const { data: newV, error: createError } = await supabase.from('ventures').insert({
            name: 'Test2',
            description: 'Test Venture for Committee',
            growth_focus: 'New Market',
            status: 'Submitted',
            program_recommendation: 'Accelerate Core' // PRE-SETTING THIS
        }).select().single();

        if (createError) { console.error(createError); return; }
        ventureId = newV.id;
    } else {
        ventureId = ventures[0].id;
        console.log(`Updating existing Test2 (${ventureId})...`);
        const { error: updateError } = await supabase.from('ventures').update({
            program_recommendation: 'Accelerate Core',
            status: 'Submitted',
            venture_partner: null, // Reset
            agreement_milestones: null // Reset
        }).eq('id', ventureId);

        if (updateError) { console.error(updateError); return; }
    }

    console.log('Setup Complete: Test2 is ready for Committee review.');
}

setup();
