-- Allow uploader OR site owner OR admin/manager to delete photos

-- Photos table (metadata)
DROP POLICY IF EXISTS "Admins and managers can delete photos" ON public.photos;
DROP POLICY IF EXISTS "Uploader, owner, admins can delete photos" ON public.photos;

CREATE POLICY "Uploader, owner, admins can delete photos"
  ON public.photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND status = 'approved'
    )
    AND (
      uploaded_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'manager')
        AND status = 'approved'
      )
      OR EXISTS (
        SELECT 1 FROM public.sites
        WHERE sites.id = photos.site_id
        AND sites.created_by = auth.uid()
      )
    )
  );

-- Storage bucket objects (actual files)
DROP POLICY IF EXISTS "Admins and managers can delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Uploader, owner, admins can delete photos" ON storage.objects;

CREATE POLICY "Uploader, owner, admins can delete photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-photos'
  AND EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND status = 'approved'
  )
  AND (
    -- Admin/manager can delete any photo file
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
      AND status = 'approved'
    )
    -- Site owner can delete any photo file in their site folder
    OR EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = split_part(storage.objects.name, '/', 1)::uuid
      AND sites.created_by = auth.uid()
    )
    -- Uploader can delete their own photo file (matched via photos.url suffix)
    OR EXISTS (
      SELECT 1 FROM public.photos
      WHERE photos.site_id = split_part(storage.objects.name, '/', 1)::uuid
      AND photos.uploaded_by = auth.uid()
      AND photos.url LIKE ('%' || storage.objects.name)
    )
  )
);

