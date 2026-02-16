
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Verifying Committee Workflow Data...');

    // Authenticate as Committee
    const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'committee@admin.com',
        password: 'admin123'
    });

    if (authError) {
        console.error('Authentication failed:', authError);
        return;
    }
    console.log('Authenticated as Committee Admin');

    const { data: targetVenture } = await supabase
        .from('ventures')
        .select('name, status, venture_partner')
        .eq('name', 'Test2')
        .single();

    if (targetVenture) {
        console.log('\nVERIFICATION RESULT:');
        console.log(`- Name: ${targetVenture.name}`);
        console.log(`- Status: ${targetVenture.status}`);
        console.log(`- Partner: ${targetVenture.venture_partner}`);
    } else {
        console.log('Test2 not found.');
    }
}

verify();
