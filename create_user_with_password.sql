-- Create a function to properly hash password for Supabase
-- This uses Supabase's internal password hashing

CREATE OR REPLACE FUNCTION create_user_with_password(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  hashed_password TEXT;
BEGIN
  -- Generate UUID
  new_user_id := gen_random_uuid();
  
  -- Use Supabase's password hashing (requires extensions.crypt)
  -- Note: This may need adjustment based on your Supabase version
  hashed_password := crypt(p_password, gen_salt('bf', 10));
  
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    p_email,
    hashed_password,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', COALESCE(p_full_name, '')),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );
  
  RETURN new_user_id;
END;
$$;

-- Now create the user
SELECT create_user_with_password(
  'oxfordgalawan@gmail.com',
  'hackmenot',
  'Oxford'
) AS user_id;

-- Wait a moment for trigger
SELECT pg_sleep(0.5);

-- Update profile to admin
UPDATE public.user_profiles 
SET 
  status = 'approved',
  role = 'admin',
  approved_at = NOW()
WHERE email = 'oxfordgalawan@gmail.com';

-- Clean up the function (optional)
-- DROP FUNCTION create_user_with_password(TEXT, TEXT, TEXT);

