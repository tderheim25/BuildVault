-- Test if the user profile can be accessed
-- This will help diagnose the issue

-- Step 1: Verify the profile exists and is correct
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  approved_at,
  created_at
FROM public.user_profiles
WHERE email = 'oxfordgalawan@gmail.com';

-- Step 2: Get the auth user ID to compare
SELECT 
  id as auth_user_id,
  email as auth_email
FROM auth.users
WHERE email = 'oxfordgalawan@gmail.com';

-- Step 3: Check if there's a mismatch between auth.users and user_profiles
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  up.id as profile_id,
  up.email as profile_email,
  up.status,
  up.role,
  CASE 
    WHEN au.id = up.id THEN 'IDs match ✓'
    ELSE 'IDs DO NOT MATCH ✗'
  END as id_match
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'oxfordgalawan@gmail.com';

-- Step 4: If IDs don't match, we need to fix it
-- (This would only run if there's a mismatch)
-- UPDATE public.user_profiles
-- SET id = (SELECT id FROM auth.users WHERE email = 'oxfordgalawan@gmail.com')
-- WHERE email = 'oxfordgalawan@gmail.com'
-- AND id != (SELECT id FROM auth.users WHERE email = 'oxfordgalawan@gmail.com');

