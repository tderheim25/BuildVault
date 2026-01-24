import { NextResponse } from 'next/server'
import { createClient as createAuthedClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { Database, UserRole, UserStatus } from '@/types/database'

type JwtClaims = {
  iss?: string
  ref?: string
  role?: string
  iat?: number
  exp?: number
}

function isUserRole(value: unknown): value is UserRole {
  return value === 'admin' || value === 'manager' || value === 'staff'
}

function isUserStatus(value: unknown): value is UserStatus {
  return value === 'pending' || value === 'approved' || value === 'rejected'
}

function decodeJwtClaims(jwt: string): JwtClaims | null {
  try {
    const parts = jwt.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const json = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    return JSON.parse(json) as JwtClaims
  } catch {
    return null
  }
}

function getRefFromSupabaseUrl(url: string): string | null {
  try {
    const u = new URL(url)
    // <ref>.supabase.co
    const hostParts = u.hostname.split('.')
    return hostParts.length >= 3 ? hostParts[0] : null
  } catch {
    return null
  }
}

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL')
  }

  // Fast sanity checks so we fail loudly with actionable info
  const claims = decodeJwtClaims(serviceKey)
  const expectedRef = getRefFromSupabaseUrl(url)
  if (!claims || !claims.role || !claims.ref) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not a valid JWT (expected an eyJ... token)')
  }
  if (claims.role !== 'service_role') {
    throw new Error(`SUPABASE_SERVICE_ROLE_KEY role is "${claims.role}" (expected "service_role")`)
  }
  if (expectedRef && claims.ref !== expectedRef) {
    throw new Error(`SUPABASE_SERVICE_ROLE_KEY ref is "${claims.ref}" but URL ref is "${expectedRef}"`)
  }

  return createAdminClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function requireAdminOrManager() {
  const supabase = await createAuthedClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false as const, response: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { ok: false as const, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  const typedProfile = profile as { role: UserRole; status: UserStatus }

  if (typedProfile.status !== 'approved' || (typedProfile.role !== 'admin' && typedProfile.role !== 'manager')) {
    return { ok: false as const, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { ok: true as const, userId: user.id, role: typedProfile.role }
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const authz = await requireAdminOrManager()
  if (!authz.ok) return authz.response

  try {
    const admin = getAdminSupabase()

    const { data: profile, error: profileError } = await admin
      .from('user_profiles')
      .select('id, email, full_name, role, status, created_at, approved_by, approved_at')
      .eq('id', params.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    const { data: accessRows, error: accessError } = await admin
      .from('user_site_access')
      .select('site_id')
      .eq('user_id', params.id)

    if (accessError) {
      return NextResponse.json({ error: accessError.message }, { status: 400 })
    }

    const typedAccessRows = (accessRows || []) as { site_id: string }[]

    return NextResponse.json({
      profile,
      siteIds: typedAccessRows.map(r => r.site_id),
    })
  } catch (e: any) {
    // Include safe diagnostics in dev to make "Invalid API key" actionable.
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || ''
    const claims = serviceKey ? decodeJwtClaims(serviceKey) : null
    const expectedRef = url ? getRefFromSupabaseUrl(url) : null

    return NextResponse.json(
      {
        error: e?.message || 'Unexpected error',
        ...(process.env.NODE_ENV === 'development'
          ? {
              debug: {
                hasUrl: Boolean(url),
                hasServiceKey: Boolean(serviceKey),
                serviceKeyLooksLikeJwt: serviceKey.startsWith('eyJ'),
                serviceKeyRole: claims?.role ?? null,
                serviceKeyRef: claims?.ref ?? null,
                urlRef: expectedRef ?? null,
              },
            }
          : {}),
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const authz = await requireAdminOrManager()
  if (!authz.ok) return authz.response

  try {
    const body = await request.json().catch(() => ({}))

    const full_name: unknown = body.full_name
    const role: unknown = body.role
    const status: unknown = body.status
    const siteIds: unknown = body.siteIds

    const update: Database['public']['Tables']['user_profiles']['Update'] = {}

    if (typeof full_name === 'string') {
      update.full_name = full_name.trim() || null
    }
    if (role !== undefined) {
      if (!isUserRole(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
      update.role = role
    }
    let updatingStatus = false
    if (status !== undefined) {
      if (!isUserStatus(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      updatingStatus = true
      update.status = status
      update.approved_by = authz.userId
      update.approved_at = new Date().toISOString()
    }

    const admin = getAdminSupabase()

    // Update profile first (if requested)
    if (Object.keys(update).length > 0) {
      const { error: updateError } = await admin
        .from('user_profiles')
        .update(update as Database['public']['Tables']['user_profiles']['Update'])
        .eq('id', params.id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 })
      }
    } else if (!updatingStatus && siteIds === undefined) {
      return NextResponse.json({ ok: true })
    }

    // Update project access assignments (optional)
    if (siteIds !== undefined) {
      if (!Array.isArray(siteIds) || !siteIds.every(id => typeof id === 'string')) {
        return NextResponse.json({ error: 'siteIds must be an array of strings' }, { status: 400 })
      }

      // Determine final role (if role not provided, read it)
      let effectiveRole: UserRole | null = update.role ?? null
      if (!effectiveRole) {
        const { data: targetProfile, error: targetError } = await admin
          .from('user_profiles')
          .select('role')
          .eq('id', params.id)
          .single()
        if (targetError) return NextResponse.json({ error: targetError.message }, { status: 400 })
        const typedTargetProfile = targetProfile as { role: UserRole } | null
        if (!typedTargetProfile) {
          return NextResponse.json({ error: 'User profile not found' }, { status: 400 })
        }
        effectiveRole = typedTargetProfile.role
      }

      // Always clear existing assignments
      const { error: delError } = await admin
        .from('user_site_access')
        .delete()
        .eq('user_id', params.id)

      if (delError) {
        return NextResponse.json({ error: delError.message }, { status: 400 })
      }

      // Only store explicit assignments for staff
      if (effectiveRole === 'staff' && siteIds.length > 0) {
        const uniqueSiteIds = Array.from(new Set(siteIds))
        const { error: insError } = await admin
          .from('user_site_access')
          .insert(
            uniqueSiteIds.map(site_id => ({
              user_id: params.id,
              site_id,
              assigned_by: authz.userId,
            }))
          )

        if (insError) {
          return NextResponse.json({ error: insError.message }, { status: 400 })
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const authz = await requireAdminOrManager()
  if (!authz.ok) return authz.response

  if (params.id === authz.userId) {
    return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
  }

  try {
    const admin = getAdminSupabase()
    const { error } = await admin.auth.admin.deleteUser(params.id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

