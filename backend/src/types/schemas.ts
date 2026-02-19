import { z } from 'zod';

// Auth schemas
export const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    role: z.enum(['entrepreneur', 'vsm', 'committee', 'admin']).optional().default('entrepreneur'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// Growth data schema
const growthDataSchema = z.object({
    product: z.string().optional(),
    geography: z.string().optional(),
    segment: z.string().optional(),
    revenue: z.string().optional(),
}).optional();

// Commitment data schema
const commitmentDataSchema = z.object({
    investment: z.string().optional(),
    teamSize: z.union([z.string(), z.number()]).optional(),
    progress: z.string().optional(),
}).optional();

// Venture schemas
export const createVentureSchema = z.object({
    name: z.string().min(2, 'Venture name must be at least 2 characters'),
    founder_name: z.string().optional(),
    program: z.string().min(1, 'Program is required'),
    growth_current: growthDataSchema,
    growth_target: growthDataSchema,
    growth_focus: z.string().optional(),
    commitment: commitmentDataSchema,
    blockers: z.string().optional(),
    support_request: z.string().optional(),
});

export const updateVentureSchema = z.object({
    name: z.string().min(2).optional(),
    founder_name: z.string().optional(),
    program: z.string().min(1).optional(),
    status: z.string().optional(), // Allow any status string for flexibility
    growth_current: growthDataSchema,
    growth_target: growthDataSchema,
    growth_focus: z.string().optional(),
    commitment: commitmentDataSchema,
    blockers: z.string().optional(),
    support_request: z.string().optional(),

    // VSM Fields
    vsm_notes: z.string().optional(),
    program_recommendation: z.string().optional(),
    internal_comments: z.string().optional(),
    ai_analysis: z.any().optional(), // JSONB field
    vsm_reviewed_at: z.string().optional(), // Timestamp when VSM reviewed

    // Committee Fields
    venture_partner: z.string().optional(),
    committee_feedback: z.string().optional(),
    committee_decision: z.string().optional(),

    // Agreement Fields
    agreement_status: z.string().optional(),

    // Additional fields from application form
    city: z.string().optional(),
    location: z.string().optional(),
    revenue_12m: z.string().optional(),
    revenue_potential_3y: z.string().optional(),
    min_investment: z.string().optional(),
    incremental_hiring: z.string().optional(),
    full_time_employees: z.string().optional(),
});

// Stream schemas
const streamStatusSchema = z.enum([
    // New statuses
    'Not started',
    'On track',
    'Need some advice',
    'Need deep support',
    'Completed',
    // Legacy mapping support
    'No help needed',
    'Working on it',
    'Need guidance',
    'At Risk',
    'Done',
    'Work in Progress'
]);

export const createStreamSchema = z.object({
    stream_name: z.string().min(1, 'Stream name is required'),
    status: streamStatusSchema,
});

export const updateStreamSchema = z.object({
    stream_name: z.string().min(1).optional(),
    status: streamStatusSchema.optional(),
});

// Query parameter schemas
export const ventureQuerySchema = z.object({
    status: z.enum(['draft', 'submitted', 'screening', 'committee_review', 'approved', 'rejected']).optional(),
    program: z.string().optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default('50'),
    offset: z.string().transform(Number).pipe(z.number().int().nonnegative()).optional().default('0'),
});
