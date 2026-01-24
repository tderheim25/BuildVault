import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PhotoGalleryClient } from './PhotoGalleryClient'
import { AppLayout } from '@/components/AppLayout'

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, status, full_name, email')
    .eq('id', user.id)
    .single()

  type ProfileData = { role: string; status: string; full_name: string | null; email: string } | null
  const typedProfile = profile as ProfileData

  if (!typedProfile || typedProfile.status !== 'approved') {
    redirect('/pending-approval')
  }

  const { data: site } = await supabase
    .from('sites')
    .select('id, name, description, address, created_at, created_by')
    .eq('id', params.id)
    .single()

  type SiteData = { id: string; name: string; description: string | null; address: string | null; created_at: string; created_by: string } | null
  const typedSite = site as SiteData

  if (!typedSite) {
    notFound()
  }

  const { data: photos } = await supabase
    .from('photos')
    .select('id, url, file_name, description, created_at, uploaded_by')
    .eq('site_id', params.id)
    .order('created_at', { ascending: false })

  // Fetch uploader information for all photos
  const uploaderIds = [...new Set(photos?.map(p => p.uploaded_by) || [])]
  let uploadersMap: Record<string, { full_name: string | null; email: string }> = {}
  
  if (uploaderIds.length > 0) {
    const { data: uploaders } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .in('id', uploaderIds)
    
    if (uploaders) {
      uploadersMap = uploaders.reduce((acc, uploader) => {
        acc[uploader.id] = { full_name: uploader.full_name, email: uploader.email }
        return acc
      }, {} as Record<string, { full_name: string | null; email: string }>)
    }
  }

  // Enrich photos with uploader info
  const enrichedPhotos = photos?.map(photo => ({
    ...photo,
    uploader: uploadersMap[photo.uploaded_by] || { full_name: null, email: 'Unknown' }
  })) || []

  const { count: totalSites } = await supabase
    .from('sites')
    .select('*', { count: 'exact', head: true })

  const userName = typedProfile.full_name || 'User'
  const userEmail = typedProfile.email || user.email || ''

  return (
    <AppLayout userRole={typedProfile.role as 'admin' | 'manager' | 'staff'} userName={userName} userEmail={userEmail} projectCount={totalSites || 0}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 text-[#1e3a8a]">
            {typedSite.name}
          </h1>
            {typedSite.description && (
            <p className="text-gray-700 text-base sm:text-lg mb-2">{typedSite.description}</p>
          )}
          {typedSite.address && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="break-words">{typedSite.address}</span>
            </div>
          )}
        </div>

        <div className="grid gap-6">
          <Card className="ios-card ios-shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-[#1e3a8a]">Photos</CardTitle>
              <CardDescription className="text-gray-600 text-sm sm:text-base">View and manage project photos</CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoGalleryClient 
                photos={enrichedPhotos} 
                currentUserId={user.id}
                currentUserRole={typedProfile.role as 'admin' | 'manager' | 'staff'}
                siteOwnerId={typedSite.created_by}
                siteId={typedSite.id}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

