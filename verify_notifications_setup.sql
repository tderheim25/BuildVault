-- Verification script to check if notifications are set up correctly
-- Run this in your Supabase SQL editor to verify the setup

-- 1. Check if notifications table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'notifications'
) AS notifications_table_exists;

-- 2. Check if trigger exists
SELECT EXISTS (
  SELECT FROM pg_trigger 
  WHERE tgname = 'trigger_create_photo_upload_notifications'
) AS trigger_exists;

-- 3. Check if function exists
SELECT EXISTS (
  SELECT FROM pg_proc 
  WHERE proname = 'create_photo_upload_notifications'
) AS function_exists;

-- 4. Count existing notifications
SELECT COUNT(*) AS notification_count FROM notifications;

-- 5. Check recent photos
SELECT id, site_id, uploaded_by, created_at 
FROM photos 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Check managers and admins
SELECT id, email, full_name, role, status 
FROM user_profiles 
WHERE role IN ('admin', 'manager') 
AND status = 'approved';

-- 7. Test: Manually create a notification (replace user_id with an actual manager/admin user_id)
-- Uncomment and modify the user_id below to test
/*
INSERT INTO notifications (user_id, type, title, message, site_id, uploaded_by)
SELECT 
  id,
  'photo_upload',
  'Test Notification',
  'This is a test notification',
  (SELECT id FROM sites LIMIT 1),
  (SELECT id FROM user_profiles WHERE role = 'staff' LIMIT 1)
FROM user_profiles
WHERE role IN ('admin', 'manager')
AND status = 'approved'
LIMIT 1;
*/
