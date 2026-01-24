import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserManagementClient } from './UserManagementClient'
import { AppLayout } from '@/components/AppLayout'

export default async function AdminUsersPage() {
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

  if (typedProfile.role !== 'admin' && typedProfile.role !== 'manager') {
    redirect('/')
  }

  const { data: users } = await supabase
    .from('user_profiles')
    .select('id, email, full_name, role, status, created_at, approved_by, approved_at')
    .order('created_at', { ascending: false })

  const { data: sites } = await supabase
    .from('sites')
    .select('id, name')
    .order('created_at', { ascending: false })

  const { count: totalSites } = await supabase
    .from('sites')
    .select('*', { count: 'exact', head: true })

  const userName = typedProfile.full_name || 'User'
  const userEmail = typedProfile.email || user.email || ''

  return (
    <AppLayout userRole={typedProfile.role as 'admin' | 'manager' | 'staff'} userName={userName} userEmail={userEmail} projectCount={totalSites || 0}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-[#1e3a8a]">
            User Management
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">Manage user accounts and approvals</p>
        </div>

        <Card className="ios-card ios-shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-[#1e3a8a]">Users</CardTitle>
            <CardDescription className="text-gray-600">Approve or reject user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <UserManagementClient
              initialUsers={users || []}
              initialSites={sites || []}
              currentUserId={user.id}
              currentUserRole={typedProfile.role as 'admin' | 'manager'}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}


