-- Complete fix for user profile issue
-- This will verify the user exists, create/update the profile, and ensure RLS works

-- Step 1: Get the user ID from auth.users
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'oxfordgalawan@gmail.com';
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % does not exist in auth.users', v_email;
  END IF;
  
  RAISE NOTICE 'Found user ID: %', v_user_id;
  
  -- Step 2: Insert or update the profile
  INSERT INTO public.user_profiles (id, email, full_name, role, status, approved_at)
  VALUES (
    v_user_id,
    v_email,
    'Oxford',
    'admin',
    'approved',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    approved_at = EXCLUDED.approved_at;
  
  RAISE NOTICE 'Profile created/updated successfully';
  
  -- Step 3: Verify
  PERFORM id, email, role, status
  FROM public.user_profiles
  WHERE id = v_user_id;
  
  RAISE NOTICE 'Verification complete';
END $$;

-- Final verification query
SELECT 
  up.id,
  up.email,
  up.full_name,
  up.role,
  up.status,
  up.approved_at,
  au.email as auth_email
FROM public.user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.email = 'oxfordgalawan@gmail.com';

