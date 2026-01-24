import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/AppLayout'
import { ProjectsClient } from './ProjectsClient'

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
    .select('id, name, description, address, created_at')
    .order('created_at', { ascending: false })

  type SiteData = { id: string; name: string; description: string | null; address: string | null; created_at: string }[]
  const typedSites = (sites || []) as SiteData

  const { count: totalSites } = await supabase
    .from('sites')
    .select('*', { count: 'exact', head: true })

  const userName = typedProfile.full_name || 'User'
  const userEmail = typedProfile.email || user.email || ''

  return (
    <AppLayout userRole={typedProfile.role as 'admin' | 'manager' | 'staff'} userName={userName} userEmail={userEmail} projectCount={totalSites || 0}>
      <ProjectsClient sites={typedSites} userRole={typedProfile.role as 'admin' | 'manager' | 'staff'} />
    </AppLayout>
  )
}


