-- Verify RLS policies and test user profile access
-- Run this to diagnose the issue

-- 1. Check if the user profile exists and is approved
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  approved_at
FROM public.user_profiles
WHERE email = 'oxfordgalawan@gmail.com';

-- 2. Check RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'user_profiles';

-- 3. List all RLS policies on user_profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'user_profiles';

-- 4. Get the user ID first, then we can test
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM public.user_profiles
  WHERE email = 'oxfordgalawan@gmail.com';
  
  IF v_user_id IS NOT NULL THEN
    RAISE NOTICE 'User ID for testing: %', v_user_id;
    RAISE NOTICE 'To test RLS, you would query with: WHERE id = ''%''', v_user_id;
  ELSE
    RAISE NOTICE 'User profile not found!';
  END IF;
END $$;

-- 5. If RLS is blocking, temporarily disable to test (NOT FOR PRODUCTION)
-- ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 6. Re-enable RLS (after testing)
-- ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

