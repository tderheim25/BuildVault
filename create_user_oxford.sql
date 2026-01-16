-- Create user: Oxford
-- Email: oxfordgalawan@gmail.com
-- Password: hackmenot
-- Role: admin

DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Generate UUID for the user
  new_user_id := gen_random_uuid();
  
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
    'oxfordgalawan@gmail.com',
    crypt('hackmenot', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Oxford"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );
  
  -- Wait for trigger to create user_profile, then update to admin
  PERFORM pg_sleep(0.5);
  
  -- Update profile to approved and set as admin
  UPDATE public.user_profiles 
  SET 
    status = 'approved',
    role = 'admin',
    approved_at = NOW()
  WHERE id = new_user_id;
  
  RAISE NOTICE 'User created successfully with ID: %', new_user_id;
END $$;

