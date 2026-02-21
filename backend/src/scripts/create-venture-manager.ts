/**
 * Create Venture Manager Demo Account
 *
 * Creates a demo account for Venture Manager role:
 * - Email: ravi@wadhwani.com
 * - Password: password
 * - Role: venture_mgr
 *
 * If the account already exists, it will be deleted and recreated.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables!');
    console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_SERVICE_ROLE_KEY) in backend/.env');
    console.error('\n📝 To get your service role key:');
    console.error('   1. Go to https://supabase.com/dashboard');
    console.error('   2. Select your project');
    console.error('   3. Go to Settings → API');
    console.error('   4. Copy the "service_role" key (NOT the anon key)');
    console.error('   5. Add to backend/.env: SUPABASE_SERVICE_KEY=your-key-here\n');
    process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const VENTURE_MANAGER_EMAIL = 'ravi@wadhwani.com';
const VENTURE_MANAGER_PASSWORD = 'password';
const VENTURE_MANAGER_NAME = 'Ravi Kumar';

async function deleteExistingUser(email: string) {
    console.log(`🔍 Checking for existing user: ${email}`);

    // Get user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('❌ Error listing users:', listError);
        return;
    }

    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        console.log(`🗑️  Deleting existing user: ${existingUser.id}`);

        const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);

        if (deleteError) {
            console.error('❌ Error deleting user:', deleteError);
            throw deleteError;
        }

        console.log('✅ Existing user deleted');
    } else {
        console.log('ℹ️  No existing user found');
    }
}

async function createVentureManager() {
    console.log('\n🚀 Creating Venture Manager Demo Account\n');
    console.log('📧 Email:', VENTURE_MANAGER_EMAIL);
    console.log('🔑 Password:', VENTURE_MANAGER_PASSWORD);
    console.log('👤 Name:', VENTURE_MANAGER_NAME);
    console.log('🎭 Role: venture_mgr\n');

    try {
        // Delete existing user if exists
        await deleteExistingUser(VENTURE_MANAGER_EMAIL);

        // Create new user
        console.log('👤 Creating new user...');
        const { data: authData, error: createError } = await supabase.auth.admin.createUser({
            email: VENTURE_MANAGER_EMAIL,
            password: VENTURE_MANAGER_PASSWORD,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                full_name: VENTURE_MANAGER_NAME,
                role: 'venture_mgr'
            }
        });

        if (createError) {
            console.error('❌ Error creating user:', createError);
            throw createError;
        }

        const userId = authData.user.id;
        console.log('✅ User created:', userId);

        // Verify profile was created by trigger
        console.log('🔍 Checking profile...');
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            console.log('⚠️  Profile not found, creating manually...');

            // Create profile manually
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    full_name: VENTURE_MANAGER_NAME,
                    role: 'venture_mgr'
                });

            if (insertError) {
                console.error('❌ Error creating profile:', insertError);
                throw insertError;
            }

            console.log('✅ Profile created manually');
        } else {
            console.log('✅ Profile exists:', profile.role);

            // Update role if needed
            if (profile.role !== 'venture_mgr') {
                console.log('🔧 Updating profile role to venture_mgr...');
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ role: 'venture_mgr' })
                    .eq('id', userId);

                if (updateError) {
                    console.error('❌ Error updating profile:', updateError);
                } else {
                    console.log('✅ Profile role updated');
                }
            }
        }

        console.log('\n🎉 Venture Manager account created successfully!\n');
        console.log('📋 Login Details:');
        console.log('   Email:', VENTURE_MANAGER_EMAIL);
        console.log('   Password:', VENTURE_MANAGER_PASSWORD);
        console.log('   Role: venture_mgr (Venture Manager)');
        console.log('\n✨ This account can view ventures with program_recommendation = "Accelerate Prime"\n');

    } catch (error) {
        console.error('\n❌ Failed to create Venture Manager account:', error);
        process.exit(1);
    }
}

// Run the script
createVentureManager()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
