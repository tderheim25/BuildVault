-- Fix RLS policies for user_profiles to ensure users can read their own profile
-- This addresses the 500 error when fetching user profiles

-- Drop existing policy if it exists, then recreate it
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;

-- Recreate the policy to ensure users can always read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Verify the user profile exists and is set correctly
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  approved_at
FROM public.user_profiles
WHERE email = 'oxfordgalawan@gmail.com';

-- If the profile doesn't exist, create it manually
-- (Replace <user_id> with the actual UUID from auth.users)
-- INSERT INTO public.user_profiles (id, email, full_name, role, status, approved_at)
-- SELECT 
--   id,
--   email,
--   'Oxford',
--   'admin',
--   'approved',
--   NOW()
-- FROM auth.users
-- WHERE email = 'oxfordgalawan@gmail.com'
-- ON CONFLICT (id) DO UPDATE SET
--   status = 'approved',
--   role = 'admin',
--   approved_at = NOW();

