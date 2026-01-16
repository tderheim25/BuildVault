-- Simple fix: Create/update user profile for oxfordgalawan@gmail.com
-- This will fix the 500 error

-- Step 1: Create or update the profile
INSERT INTO public.user_profiles (id, email, full_name, role, status, approved_at)
SELECT 
  au.id,
  au.email,
  'Oxford',
  'admin',
  'approved',
  NOW()
FROM auth.users au
WHERE au.email = 'oxfordgalawan@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  status = 'approved',
  approved_at = NOW();

-- Step 2: Verify it worked
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  approved_at
FROM public.user_profiles
WHERE email = 'oxfordgalawan@gmail.com';

