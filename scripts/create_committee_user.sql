-- Create a demo committee user
-- Email: meetul@wadhwani.com
-- Password: password
-- Role: committee

-- Insert into auth.users
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'meetul@wadhwani.com',
    crypt('password', gen_salt('bf')), -- Bcrypt hash of 'password'
    NOW(),
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    FALSE,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    FALSE,
    NULL
)
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Insert into public.profiles with committee role
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
SELECT
    id,
    'meetul@wadhwani.com',
    'committee',
    NOW(),
    NOW()
FROM auth.users
WHERE email = 'meetul@wadhwani.com'
ON CONFLICT (id) DO UPDATE
SET role = 'committee',
    updated_at = NOW();

-- Verify the user was created
SELECT
    u.id,
    u.email,
    u.email_confirmed_at,
    p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'meetul@wadhwani.com';
