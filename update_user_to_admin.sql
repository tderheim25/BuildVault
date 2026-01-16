-- Update existing user to admin
-- Email: oxfordgalawan@gmail.com

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

