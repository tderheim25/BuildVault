import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogoutButton } from '@/components/LogoutButton'

export default async function HomePage() {
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
    .limit(6)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">BuildVault</h1>
            </div>
            <div className="flex items-center space-x-4">
              {profile.role === 'admin' || profile.role === 'manager' ? (
                <Link href="/admin/users">
                  <Button variant="outline">Manage Users</Button>
                </Link>
              ) : null}
              <Link href="/projects">
                <Button variant="outline">All Projects</Button>
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Welcome back! Manage your construction projects and photos.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Latest construction sites</CardDescription>
                </div>
                {(profile.role === 'admin' || profile.role === 'manager') && (
                  <Link href="/projects/new">
                    <Button>New Project</Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {sites && sites.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sites.map((site) => (
                    <Link key={site.id} href={`/projects/${site.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-lg">{site.name}</CardTitle>
                          {site.description && (
                            <CardDescription className="line-clamp-2">
                              {site.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No projects yet.</p>
                  {(profile.role === 'admin' || profile.role === 'manager') && (
                    <Link href="/projects/new">
                      <Button className="mt-4">Create Your First Project</Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

