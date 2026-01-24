import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is manager or admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (!profile || profile.status !== 'approved' || !['admin', 'manager'].includes(profile.role)) {
    return NextResponse.json({ notifications: [], unreadCount: 0 })
  }

  // Fetch notifications
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch site names for notifications that have site_id
  const siteIds = Array.from(
    new Set((notifications ?? []).map(n => n.site_id).filter((id): id is string => Boolean(id)))
  )
  let sitesMap: Record<string, { id: string; name: string }> = {}
  
  if (siteIds.length > 0) {
    const { data: sites } = await supabase
      .from('sites')
      .select('id, name')
      .in('id', siteIds)
    
    if (sites) {
      sitesMap = sites.reduce((acc, site) => {
        acc[site.id] = site
        return acc
      }, {} as Record<string, { id: string; name: string }>)
    }
  }

  // Fetch uploader info for notifications that have uploaded_by
  const uploaderIds = Array.from(
    new Set((notifications ?? []).map(n => n.uploaded_by).filter((id): id is string => Boolean(id)))
  )
  let uploadersMap: Record<string, { id: string; full_name: string | null; email: string }> = {}
  
  if (uploaderIds.length > 0) {
    const { data: uploaders } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .in('id', uploaderIds)
    
    if (uploaders) {
      uploadersMap = uploaders.reduce((acc, uploader) => {
        acc[uploader.id] = uploader
        return acc
      }, {} as Record<string, { id: string; full_name: string | null; email: string }>)
    }
  }

  // Enrich notifications with related data
  const enrichedNotifications = notifications?.map(notification => ({
    ...notification,
    sites: notification.site_id ? sitesMap[notification.site_id] || null : null,
    uploader: notification.uploaded_by ? uploadersMap[notification.uploaded_by] || null : null,
  })) || []

  // Count unread notifications
  const unreadCount = enrichedNotifications.filter(n => !n.read_at).length

  return NextResponse.json({ 
    notifications: enrichedNotifications, 
    unreadCount 
  })
}
