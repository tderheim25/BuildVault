import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/AppLayout'
import { CaptureClient } from './CaptureClient'

export default async function CapturePage() {
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

  // Fetch projects
  const { data: sites } = await supabase
    .from('sites')
    .select('id, name')
    .order('name', { ascending: true })

  const { count: totalSites } = await supabase
    .from('sites')
    .select('*', { count: 'exact', head: true })

  const userName = profile.full_name || 'User'
  const userEmail = profile.email || user.email || ''

  return (
    <AppLayout userRole={profile.role} userName={userName} userEmail={userEmail} projectCount={totalSites || 0}>
      <CaptureClient initialProjects={sites || []} />
    </AppLayout>
  )
}
