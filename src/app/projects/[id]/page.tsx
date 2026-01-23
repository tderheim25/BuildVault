import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PhotoUpload } from '@/components/PhotoUpload'
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

  if (!profile || profile.status !== 'approved') {
    redirect('/pending-approval')
  }

  const { data: site } = await supabase
    .from('sites')
    .select('id, name, description, address, created_at')
    .eq('id', params.id)
    .single()

  if (!site) {
    notFound()
  }

  const { data: photos } = await supabase
    .from('photos')
    .select('id, url, file_name, description, created_at')
    .eq('site_id', params.id)
    .order('created_at', { ascending: false })

  const canManage = profile.role === 'admin' || profile.role === 'manager'
  const userName = profile.full_name || 'User'
  const userEmail = profile.email || user.email || ''

  return (
    <AppLayout userRole={profile.role} userName={userName} userEmail={userEmail}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 text-[#1e3a8a]">
            {site.name}
          </h1>
          {site.description && (
            <p className="text-gray-700 text-lg mb-2">{site.description}</p>
          )}
          {site.address && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{site.address}</span>
            </div>
          )}
        </div>

        <div className="grid gap-6">
          <Card className="ios-card ios-shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-[#1e3a8a]">Photos</CardTitle>
              <CardDescription className="text-gray-600">Upload and manage project photos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <PhotoUpload siteId={params.id} />
              <div className="border-t border-gray-100 pt-6">
                <PhotoGalleryClient 
                  photos={photos || []} 
                  canDelete={canManage}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

