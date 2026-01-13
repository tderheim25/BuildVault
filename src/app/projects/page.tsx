import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/ProjectCard'

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
              {(profile.role === 'admin' || profile.role === 'manager') && (
                <Link href="/admin/users">
                  <Button variant="outline">Manage Users</Button>
                </Link>
              )}
              <Link href="/">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
            <p className="text-gray-600">All construction projects</p>
          </div>
          {(profile.role === 'admin' || profile.role === 'manager') && (
            <Link href="/projects/new">
              <Button>New Project</Button>
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
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No projects yet.</p>
            {(profile.role === 'admin' || profile.role === 'manager') && (
              <Link href="/projects/new">
                <Button>Create Your First Project</Button>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  )
}


