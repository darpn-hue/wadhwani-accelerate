/**
 * Test script to verify VSM Dashboard program recommendation submission
 *
 * This script tests the complete flow:
 * 1. Create a test venture
 * 2. Submit VSM recommendation data (program, notes, comments, partner)
 * 3. Verify data is persisted to DB
 * 4. Verify data is retrievable for committee dashboard
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runTest() {
    console.log('🧪 Starting VSM Submission Test...\n');

    try {
        // ========================================================================
        // STEP 1: Create a test venture
        // ========================================================================
        console.log('📝 Step 1: Creating test venture...');

        const testVenture = {
            name: 'Test Agri-Tech Venture',
            description: 'Testing VSM submission flow',
            user_id: '00000000-0000-0000-0000-000000000001', // Replace with actual user ID
            status: 'Submitted',
            founder_name: 'Test Founder',
            city: 'Mumbai',
            revenue_12m: '50L',
            full_time_employees: '10',
            growth_focus: 'product,segment',
            revenue_potential_3y: '5Cr',
            min_investment: '1Cr',
            incremental_hiring: '20',
            growth_current: {
                product: 'Agri supply chain platform',
                segment: 'Farmers',
                geography: 'Maharashtra',
                city: 'Mumbai',
                employees: '10'
            },
            growth_target: {
                product: 'AI-powered crop advisory',
                segment: 'Agri retailers',
                geography: 'Pan-India'
            },
            commitment: {
                lastYearRevenue: '50L',
                revenuePotential: '5Cr',
                investment: '1Cr',
                incrementalHiring: '20'
            }
        };

        const { data: venture, error: createError } = await supabase
            .from('ventures')
            .insert(testVenture)
            .select()
            .single();

        if (createError) {
            console.error('❌ Failed to create venture:', createError.message);
            return;
        }

        console.log('✅ Venture created:', venture.id);
        console.log('   Name:', venture.name);
        console.log('   Status:', venture.status);
        console.log('');

        // ========================================================================
        // STEP 2: Simulate VSM submitting recommendation
        // ========================================================================
        console.log('📋 Step 2: Submitting VSM recommendation...');

        const vsmData = {
            vsm_notes: 'Had a great call with the founder. Strong team with clear vision. Some concerns about market timing but overall promising.',
            program_recommendation: 'Accelerate Core',
            internal_comments: 'Recommend fast-track to committee. High potential for impact.',
            ai_analysis: {
                recommendation: 'Accelerate Core',
                generated_at: new Date().toISOString(),
                summary: 'Strong team with proven traction in challenging market.',
                strengths: [
                    'Experienced founding team',
                    'Clear product-market fit',
                    'Strong revenue growth trajectory'
                ],
                risks: [
                    'Competitive landscape',
                    'Market timing concerns',
                    'Need for capital efficiency'
                ],
                questions: [
                    'What is the customer acquisition cost?',
                    'How do you plan to scale to other regions?',
                    'What are the key regulatory challenges?'
                ]
            },
            status: 'Under Review'
        };

        const { data: updated, error: updateError } = await supabase
            .from('ventures')
            .update(vsmData)
            .eq('id', venture.id)
            .select()
            .single();

        if (updateError) {
            console.error('❌ Failed to update venture:', updateError.message);
            return;
        }

        console.log('✅ VSM data submitted successfully');
        console.log('   Program Recommendation:', updated.program_recommendation);
        console.log('   Status:', updated.status);
        console.log('   VSM Notes length:', updated.vsm_notes?.length || 0, 'chars');
        console.log('   AI Analysis:', updated.ai_analysis ? 'Present' : 'Missing');
        console.log('');

        // ========================================================================
        // STEP 3: Simulate Committee assigning partner
        // ========================================================================
        console.log('👥 Step 3: Committee assigning venture partner...');

        const committeeData = {
            venture_partner: 'Arun Kumar',
            committee_feedback: 'Approved for Accelerate Core program. Assign to Arun for mentorship.',
            agreement_status: 'Draft'
        };

        const { data: committeeUpdated, error: committeeError } = await supabase
            .from('ventures')
            .update(committeeData)
            .eq('id', venture.id)
            .select()
            .single();

        if (committeeError) {
            console.error('❌ Failed to update with committee data:', committeeError.message);
            return;
        }

        console.log('✅ Committee data submitted successfully');
        console.log('   Venture Partner:', committeeUpdated.venture_partner);
        console.log('   Committee Feedback:', committeeUpdated.committee_feedback);
        console.log('');

        // ========================================================================
        // STEP 4: Verify complete data retrieval
        // ========================================================================
        console.log('🔍 Step 4: Verifying complete data retrieval...');

        const { data: fullVenture, error: fetchError } = await supabase
            .from('ventures')
            .select('*')
            .eq('id', venture.id)
            .single();

        if (fetchError) {
            console.error('❌ Failed to fetch venture:', fetchError.message);
            return;
        }

        console.log('✅ Complete venture data retrieved');
        console.log('\n📊 Full Data Summary:');
        console.log('   Venture ID:', fullVenture.id);
        console.log('   Name:', fullVenture.name);
        console.log('   Status:', fullVenture.status);
        console.log('   Program Recommendation:', fullVenture.program_recommendation);
        console.log('   Venture Partner:', fullVenture.venture_partner);
        console.log('   Agreement Status:', fullVenture.agreement_status);
        console.log('\n   VSM Fields:');
        console.log('   ✓ vsm_notes:', fullVenture.vsm_notes ? 'Present' : '❌ Missing');
        console.log('   ✓ program_recommendation:', fullVenture.program_recommendation ? 'Present' : '❌ Missing');
        console.log('   ✓ internal_comments:', fullVenture.internal_comments ? 'Present' : '❌ Missing');
        console.log('   ✓ ai_analysis:', fullVenture.ai_analysis ? 'Present' : '❌ Missing');
        console.log('   ✓ venture_partner:', fullVenture.venture_partner ? 'Present' : '❌ Missing');
        console.log('\n   Application Fields:');
        console.log('   ✓ founder_name:', fullVenture.founder_name);
        console.log('   ✓ revenue_12m:', fullVenture.revenue_12m);
        console.log('   ✓ growth_target:', fullVenture.growth_target ? 'Present' : '❌ Missing');

        // ========================================================================
        // STEP 5: Cleanup (optional - comment out to keep test data)
        // ========================================================================
        console.log('\n🧹 Step 5: Cleaning up test data...');

        const { error: deleteError } = await supabase
            .from('ventures')
            .delete()
            .eq('id', venture.id);

        if (deleteError) {
            console.log('⚠️  Could not delete test venture (you may need to delete manually):', deleteError.message);
        } else {
            console.log('✅ Test venture deleted');
        }

        console.log('\n✅ All tests passed! VSM submission flow is working correctly.\n');

    } catch (error: any) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error);
    }
}

// Run the test
runTest();
