import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/ProjectCard'
import { AppLayout } from '@/components/AppLayout'

export default async function ProjectsPage() {
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

  const { data: sites } = await supabase
    .from('sites')
    .select('id, name, description, created_at')
    .order('created_at', { ascending: false })

  type SiteData = { id: string; name: string; description: string | null; created_at: string }[]
  const typedSites = (sites || []) as SiteData

  const { count: totalSites } = await supabase
    .from('sites')
    .select('*', { count: 'exact', head: true })

  const userName = typedProfile.full_name || 'User'
  const userEmail = typedProfile.email || user.email || ''

  return (
    <AppLayout userRole={typedProfile.role as 'admin' | 'manager' | 'staff'} userName={userName} userEmail={userEmail} projectCount={totalSites || 0}>
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-gradient">
              Projects
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">All construction projects</p>
          </div>
          {(typedProfile.role === 'admin' || typedProfile.role === 'manager') && (
            <Link href="/projects/new" className="flex-shrink-0">
              <Button className="w-full sm:w-auto">
                New Project
              </Button>
            </Link>
          )}
        </div>

        {typedSites && typedSites.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {typedSites.map((site) => (
              <ProjectCard
                key={site.id}
                id={site.id}
                name={site.name}
                description={site.description}
                createdAt={site.created_at}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 mb-4 sm:mb-6">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-700 text-base sm:text-lg mb-2 font-medium">No projects yet.</p>
            <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">Get started by creating your first construction project</p>
            {(typedProfile.role === 'admin' || typedProfile.role === 'manager') && (
              <Link href="/projects/new">
                <Button className="px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base">
                  Create Your First Project
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}


