-- Verify and fix user profile for oxfordgalawan@gmail.com
-- Run this in Supabase SQL Editor

-- First, check if the user exists in auth.users
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'oxfordgalawan@gmail.com';

-- Check if the profile exists
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  approved_at
FROM public.user_profiles
WHERE email = 'oxfordgalawan@gmail.com';

-- If profile doesn't exist, create it (replace <user_id> with the UUID from above)
-- INSERT INTO public.user_profiles (id, email, full_name, role, status, approved_at)
-- VALUES (
--   '<user_id_from_auth_users>',
--   'oxfordgalawan@gmail.com',
--   'Oxford',
--   'admin',
--   'approved',
--   NOW()
-- );

-- If profile exists but is not approved, update it:
UPDATE public.user_profiles 
SET 
  status = 'approved',
  role = 'admin',
  approved_at = NOW()
WHERE email = 'oxfordgalawan@gmail.com';

-- Verify the update
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  approved_at
FROM public.user_profiles
WHERE email = 'oxfordgalawan@gmail.com';

