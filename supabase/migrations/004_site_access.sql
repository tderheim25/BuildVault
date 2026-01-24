-- Per-site access assignments for staff

-- Create access table
CREATE TABLE IF NOT EXISTS public.user_site_access (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, site_id)
);

CREATE INDEX IF NOT EXISTS idx_user_site_access_user_id ON public.user_site_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_site_access_site_id ON public.user_site_access(site_id);

ALTER TABLE public.user_site_access ENABLE ROW LEVEL SECURITY;

-- Policies for user_site_access
DROP POLICY IF EXISTS "Users can read own site access" ON public.user_site_access;
CREATE POLICY "Users can read own site access"
  ON public.user_site_access FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins and managers can read all site access" ON public.user_site_access;
CREATE POLICY "Admins and managers can read all site access"
  ON public.user_site_access FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
      AND status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Admins and managers can manage site access" ON public.user_site_access;
CREATE POLICY "Admins and managers can manage site access"
  ON public.user_site_access FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
      AND status = 'approved'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
      AND status = 'approved'
    )
  );

-- Update sites SELECT policy: admin/manager see all; staff only assigned (or creator)
DROP POLICY IF EXISTS "Approved users can read sites" ON public.sites;
DROP POLICY IF EXISTS "Approved users can read assigned sites" ON public.sites;
CREATE POLICY "Approved users can read assigned sites"
  ON public.sites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND status = 'approved'
    )
    AND (
      -- Admins/managers can read all sites
      EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'manager')
        AND status = 'approved'
      )
      -- Site creator can read their sites (mostly admin/manager)
      OR created_by = auth.uid()
      -- Staff can read sites they are assigned to
      OR EXISTS (
        SELECT 1 FROM public.user_site_access
        WHERE user_site_access.user_id = auth.uid()
        AND user_site_access.site_id = sites.id
      )
    )
  );

-- Update photos SELECT/INSERT policies to align with site access
DROP POLICY IF EXISTS "Approved users can read photos" ON public.photos;
DROP POLICY IF EXISTS "Approved users can read accessible photos" ON public.photos;
CREATE POLICY "Approved users can read accessible photos"
  ON public.photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND status = 'approved'
    )
    AND (
      -- Admins/managers can read all photos
      EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'manager')
        AND status = 'approved'
      )
      -- Site creator can read photos in their sites
      OR EXISTS (
        SELECT 1 FROM public.sites
        WHERE sites.id = photos.site_id
        AND sites.created_by = auth.uid()
      )
      -- Assigned staff can read photos for assigned sites
      OR EXISTS (
        SELECT 1 FROM public.user_site_access
        WHERE user_site_access.user_id = auth.uid()
        AND user_site_access.site_id = photos.site_id
      )
    )
  );

DROP POLICY IF EXISTS "Approved users can insert photos" ON public.photos;
DROP POLICY IF EXISTS "Approved users can insert photos into accessible sites" ON public.photos;
CREATE POLICY "Approved users can insert photos into accessible sites"
  ON public.photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND status = 'approved'
    )
    AND uploaded_by = auth.uid()
    AND (
      -- Admins/managers can upload anywhere
      EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'manager')
        AND status = 'approved'
      )
      -- Site creator can upload into their sites
      OR EXISTS (
        SELECT 1 FROM public.sites
        WHERE sites.id = photos.site_id
        AND sites.created_by = auth.uid()
      )
      -- Assigned staff can upload into their assigned sites
      OR EXISTS (
        SELECT 1 FROM public.user_site_access
        WHERE user_site_access.user_id = auth.uid()
        AND user_site_access.site_id = photos.site_id
      )
    )
  );

