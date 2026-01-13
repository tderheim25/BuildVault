-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-photos', 'project-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for project-photos bucket
-- Anyone authenticated can read photos
CREATE POLICY "Authenticated users can view photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-photos' AND
  auth.role() = 'authenticated'
);

-- Approved users can upload photos
CREATE POLICY "Approved users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-photos' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND status = 'approved'
  )
);

-- Admins and managers can update photos
CREATE POLICY "Admins and managers can update photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-photos' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager')
    AND status = 'approved'
  )
);

-- Admins and managers can delete photos
CREATE POLICY "Admins and managers can delete photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-photos' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager')
    AND status = 'approved'
  )
);


