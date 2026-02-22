import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createCommitteeUser() {
    try {
        // Create the user using Supabase Admin API
        const { data: user, error: signUpError } = await supabase.auth.admin.createUser({
            email: 'meetul@wadhwani.com',
            password: 'password',
            email_confirm: true,
            user_metadata: {
                role: 'committee'
            }
        });

        if (signUpError) {
            console.error('❌ Error creating user:', signUpError);
            return;
        }

        console.log('✅ User created:', user.user?.email);

        // Insert/update profile with committee role
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.user!.id,
                email: 'meetul@wadhwani.com',
                role: 'committee',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        if (profileError) {
            console.error('❌ Error creating profile:', profileError);
            return;
        }

        console.log('✅ Profile created with committee role');
        console.log('\n🎉 Committee user created successfully!');
        console.log('📧 Email: meetul@wadhwani.com');
        console.log('🔑 Password: password');
        console.log('👤 Role: committee');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

createCommitteeUser();
