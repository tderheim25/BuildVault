# Notifications Troubleshooting Guide

If notifications aren't showing up after uploading photos, follow these steps:

## Step 1: Verify Migration Has Been Run

The notifications feature requires running the migration file `supabase/migrations/005_notifications.sql` in your Supabase SQL editor.

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/005_notifications.sql`
4. Run the SQL script

## Step 2: Verify Setup

Run the verification script `verify_notifications_setup.sql` in your Supabase SQL editor to check:
- If the notifications table exists
- If the trigger exists
- If the function exists
- How many notifications exist
- How many managers/admins exist

## Step 3: Check Common Issues

### Issue 1: You're the only Manager/Admin
**Problem**: If you're the only manager/admin in the system and you're uploading photos, you won't receive notifications (by design - you don't notify yourself).

**Solution**: 
- Create another manager/admin user account
- Upload photos from a staff account
- Or temporarily remove the `AND up.id != NEW.uploaded_by` condition in the trigger (not recommended)

### Issue 2: User Role Check
**Problem**: The notification bell only shows for managers and admins.

**Solution**: 
- Verify your user role in the `user_profiles` table
- Make sure your status is 'approved'
- Check the browser console for any errors

### Issue 3: Trigger Not Firing
**Problem**: The database trigger might not be firing when photos are uploaded.

**Solution**:
1. Check Supabase logs for trigger errors
2. Verify the trigger exists: Run `SELECT * FROM pg_trigger WHERE tgname = 'trigger_create_photo_upload_notifications';`
3. Test manually by inserting a photo record directly in SQL

### Issue 4: RLS Policies Blocking
**Problem**: Row Level Security policies might be preventing notification creation.

**Solution**: The trigger function uses `SECURITY DEFINER` which should bypass RLS, but verify:
- The function has proper permissions
- RLS policies allow the trigger to insert notifications

## Step 4: Test Manually

Test if notifications work by manually creating one:

```sql
-- Replace USER_ID with an actual manager/admin user_id
INSERT INTO notifications (user_id, type, title, message, site_id, uploaded_by)
VALUES (
  'USER_ID_HERE',
  'photo_upload',
  'Test Notification',
  'This is a test notification',
  (SELECT id FROM sites LIMIT 1),
  (SELECT id FROM user_profiles WHERE role = 'staff' LIMIT 1)
);
```

Then check if it appears in the notification dropdown.

## Step 5: Check Browser Console

Open your browser's developer console (F12) and look for:
- Any errors when fetching notifications
- Log messages from the NotificationDropdown component
- Network errors when calling `/api/notifications`

## Step 6: Verify API Endpoint

Test the API endpoint directly:
1. Open browser developer tools
2. Go to Network tab
3. Look for requests to `/api/notifications`
4. Check the response - it should return `{ notifications: [], unreadCount: 0 }` if no notifications exist

## Quick Fix Checklist

- [ ] Migration `005_notifications.sql` has been run
- [ ] You have at least 2 manager/admin users (one to upload, one to receive notification)
- [ ] Your user role is 'admin' or 'manager' and status is 'approved'
- [ ] The trigger exists in the database
- [ ] No errors in browser console
- [ ] No errors in Supabase logs
