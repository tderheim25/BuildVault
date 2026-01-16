-- Fix infinite recursion in RLS policies
-- The "Admins and managers can read all profiles" policy causes infinite recursion
-- because it queries user_profiles to check if user can read user_profiles

-- Step 1: Drop the problematic policies
DROP POLICY IF EXISTS "Admins and managers can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins and managers can update profiles" ON user_profiles;

-- Step 2: Create a security definer function that bypasses RLS to check user role
-- This avoids the infinite recursion
CREATE OR REPLACE FUNCTION check_user_is_admin_or_manager(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role user_role;
  user_status user_status;
BEGIN
  SELECT role, status INTO user_role, user_status
  FROM user_profiles
  WHERE id = user_id;
  
  RETURN COALESCE(user_role IN ('admin', 'manager') AND user_status = 'approved', false);
END;
$$;

-- Step 3: Recreate the policies using the function (this avoids recursion)
CREATE POLICY "Admins and managers can read all profiles"
  ON user_profiles FOR SELECT
  USING (check_user_is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can update profiles"
  ON user_profiles FOR UPDATE
  USING (check_user_is_admin_or_manager(auth.uid()));

-- Step 4: Verify the policies are fixed
SELECT 
  policyname,
  cmd as "Command"
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'user_profiles'
ORDER BY policyname;
