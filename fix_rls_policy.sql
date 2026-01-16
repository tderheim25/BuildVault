-- Fix RLS policy to ensure users can read their own profile
-- This should resolve the 500 error and allow approved users to access the app

-- Step 1: Drop and recreate the policy to ensure it's correct
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Step 2: Verify the user profile exists and is approved
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  approved_at
FROM public.user_profiles
WHERE email = 'oxfordgalawan@gmail.com';

-- Step 3: Verify RLS is enabled
SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'user_profiles';

-- Step 4: List all policies on user_profiles
SELECT 
  policyname,
  cmd as "Command",
  qual as "Using Expression"
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'user_profiles'
ORDER BY policyname;

