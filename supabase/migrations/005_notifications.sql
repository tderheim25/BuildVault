-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'photo_upload',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_site_id ON notifications(site_id);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
-- Users can only read their own notifications
CREATE POLICY "Users can read their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (to mark as read)
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Function to create notifications for managers and admins when photos are uploaded
CREATE OR REPLACE FUNCTION create_photo_upload_notifications()
RETURNS TRIGGER AS $$
DECLARE
  site_name TEXT;
  uploader_name TEXT;
  uploader_email TEXT;
  notification_count INTEGER;
BEGIN
  -- Get site name
  SELECT name INTO site_name
  FROM sites
  WHERE id = NEW.site_id;

  -- Get uploader info
  SELECT full_name, email INTO uploader_name, uploader_email
  FROM user_profiles
  WHERE id = NEW.uploaded_by;

  -- Create notifications for all managers and admins
  INSERT INTO notifications (user_id, type, title, message, site_id, photo_id, uploaded_by)
  SELECT 
    up.id,
    'photo_upload',
    'New Photo Uploaded',
    COALESCE(uploader_name, uploader_email, 'Someone') || ' uploaded a photo to ' || COALESCE(site_name, 'a project'),
    NEW.site_id,
    NEW.id,
    NEW.uploaded_by
  FROM user_profiles up
  WHERE up.role IN ('admin', 'manager')
    AND up.status = 'approved'
    AND up.id != NEW.uploaded_by; -- Don't notify the uploader themselves

  GET DIAGNOSTICS notification_count = ROW_COUNT;
  
  -- Log if no notifications were created (for debugging)
  -- This happens if there are no other managers/admins besides the uploader
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the photo insert
    RAISE WARNING 'Error creating notifications: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to fire after photo insert
CREATE TRIGGER trigger_create_photo_upload_notifications
  AFTER INSERT ON photos
  FOR EACH ROW
  EXECUTE FUNCTION create_photo_upload_notifications();
