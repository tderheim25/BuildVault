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
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (!profile || profile.status !== 'approved') {
    redirect('/pending-approval')
  }

  const { data: sites } = await supabase
    .from('sites')
    .select('id, name, description, created_at')
    .order('created_at', { ascending: false })

  return (
    <AppLayout userRole={profile.role}>
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gradient">
              Projects
            </h1>
            <p className="text-gray-600 text-lg">All construction projects</p>
          </div>
          {(profile.role === 'admin' || profile.role === 'manager') && (
            <Link href="/projects/new">
              <Button>
                New Project
              </Button>
            </Link>
          )}
        </div>

        {sites && sites.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
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
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 mb-6">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-700 text-lg mb-2 font-medium">No projects yet.</p>
            <p className="text-gray-500 text-sm mb-6">Get started by creating your first construction project</p>
            {(profile.role === 'admin' || profile.role === 'manager') && (
              <Link href="/projects/new">
                <Button className="px-8 py-6 text-base">
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


