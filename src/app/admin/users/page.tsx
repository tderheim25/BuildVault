import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserManagementClient } from './UserManagementClient'

export default async function AdminUsersPage() {
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

  if (profile.role !== 'admin' && profile.role !== 'manager') {
    redirect('/')
  }

  const { data: users } = await supabase
    .from('user_profiles')
    .select('id, email, full_name, role, status, created_at, approved_by, approved_at')
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
              <Link href="/projects">
                <Button variant="outline">Projects</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage user accounts and approvals</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Approve or reject user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <UserManagementClient initialUsers={users || []} currentUserId={user.id} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


