import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AppLayout } from '@/components/AppLayout'
import { Search, Bell, Calendar, Clock } from 'lucide-react'

export default async function HomePage() {
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
    .limit(6)

  type SiteData = Array<{ id: string; name: string; description: string | null; created_at: string }> | null
  const typedSites = (sites as SiteData) || []

  const { count: totalSites } = await supabase
    .from('sites')
    .select('*', { count: 'exact', head: true })

  const { count: totalPhotos } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const timeStr = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const userName = typedProfile.full_name || 'User'
  const userEmail = typedProfile.email || user.email || ''

  return (
    <AppLayout userRole={typedProfile.role as 'admin' | 'manager' | 'staff'} userName={userName} userEmail={userEmail} projectCount={totalSites || 0}>
      <div className="max-w-[1600px] mx-auto">
        {/* Gradient Header */}
        <div className="gradient-header rounded-2xl p-4 sm:p-6 mb-6 text-white">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Hello! {userName}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm opacity-90">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="break-words">{dateStr}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{timeStr}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
                />
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-xl flex-shrink-0">
                  <Bell className="h-5 w-5" />
                </Button>
                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex-shrink-0"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm font-medium text-gray-600">Total Projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{totalSites || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">As of {new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                  <span>+7%</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm font-medium text-gray-600">Total Photos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{totalPhotos || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">As of {new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                  <span>+12%</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm font-medium text-gray-600">Active Projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{sites?.length || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Recent projects</p>
                </div>
                <div className="h-16 w-20 flex items-end gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t ${
                        i === 4 ? 'bg-orange-500 h-full' : i === 3 ? 'bg-orange-400 h-3/4' : 'bg-gray-200 h-1/2'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm font-medium text-gray-600">User Activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">100%</p>
                  <p className="text-xs text-gray-500 mt-1">System status</p>
                </div>
                <div className="h-16 w-20 flex items-end gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t ${
                        i === 4 ? 'bg-orange-500 h-full' : i === 3 ? 'bg-orange-400 h-3/4' : 'bg-gray-200 h-1/2'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Recent Projects Card */}
          <Card className="lg:col-span-2 dashboard-card">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Recent Projects</CardTitle>
                  <CardDescription className="text-gray-600 text-sm sm:text-base">Latest construction sites</CardDescription>
                </div>
                {(typedProfile.role === 'admin' || typedProfile.role === 'manager') && (
                  <Link href="/projects/new" className="flex-shrink-0">
                    <Button className="w-full sm:w-auto gradient-primary hover:opacity-90 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 dashboard-button text-sm sm:text-base">
                      New Project
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {sites && sites.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {typedSites.map((site) => (
                    <Link key={site.id} href={`/projects/${site.id}`}>
                      <Card className="dashboard-card hover:shadow-md transition-all duration-200 cursor-pointer group border-gray-200">
                        <CardHeader>
                          <CardTitle className="text-base sm:text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {site.name}
                          </CardTitle>
                          {site.description && (
                            <CardDescription className="text-gray-600 line-clamp-2 text-sm">
                              {site.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 mb-4 sm:mb-6">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-gray-700 text-base sm:text-lg mb-2 font-medium">No projects yet.</p>
                  <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">Get started by creating your first construction project</p>
                  {(typedProfile.role === 'admin' || typedProfile.role === 'manager') && (
                    <Link href="/projects/new">
                      <Button className="gradient-primary hover:opacity-90 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 dashboard-button px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base">
                        Create Your First Project
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 mb-1">Quick Stats</CardTitle>
              <CardDescription className="text-gray-600">Overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{totalSites || 0}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Total Photos</p>
                <p className="text-2xl font-bold text-gray-900">{totalPhotos || 0}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

