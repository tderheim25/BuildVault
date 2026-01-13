import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PhotoUpload } from '@/components/PhotoUpload'
import { PhotoGalleryClient } from './PhotoGalleryClient'

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
    .select('role, status')
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                BuildVault
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/projects">
                <Button variant="outline">Back to Projects</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{site.name}</h1>
          {site.description && (
            <p className="text-gray-600 mb-2">{site.description}</p>
          )}
          {site.address && (
            <p className="text-sm text-gray-500">{site.address}</p>
          )}
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <CardDescription>Upload and manage project photos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <PhotoUpload siteId={params.id} />
              <div className="border-t pt-6">
                <PhotoGalleryClient 
                  photos={photos || []} 
                  canDelete={canManage}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

