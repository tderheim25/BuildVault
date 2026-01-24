'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Pencil, Trash2, Building2, Calendar, MapPin, Search } from 'lucide-react'
import { UserRole, UserStatus, Database } from '@/types/database'

interface User {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  status: UserStatus
  created_at: string
  approved_by: string | null
  approved_at: string | null
}

interface Site {
  id: string
  name: string
}

interface UserManagementClientProps {
  initialUsers: User[]
  initialSites: Site[]
  currentUserId: string
  currentUserRole: 'admin' | 'manager'
}

export function UserManagementClient({
  initialUsers,
  initialSites,
  currentUserId,
  currentUserRole,
}: UserManagementClientProps) {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [sites] = useState<Site[]>(initialSites)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editFullName, setEditFullName] = useState<string>('')
  const [editRole, setEditRole] = useState<UserRole>('staff')
  const [editStatus, setEditStatus] = useState<UserStatus>('pending')
  const [editSiteIds, setEditSiteIds] = useState<Set<string>>(new Set())
  const [availableFilter, setAvailableFilter] = useState('')
  const [assignedFilter, setAssignedFilter] = useState('')
  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(new Set())
  const [selectedAssigned, setSelectedAssigned] = useState<Set<string>>(new Set())
  const [loadingAccess, setLoadingAccess] = useState(false)

  const formatApiError = (data: any, fallback: string) => {
    const message = data?.error || fallback
    const debug = data?.debug
    if (!debug) return message
    return `${message}\n\nDebug:\n${JSON.stringify(debug, null, 2)}`
  }

  const patchUser = async (
    userId: string,
    payload: {
      full_name?: string
      role?: UserRole
      status?: UserStatus
      siteIds?: string[]
    }
  ) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(formatApiError(data, 'Request failed'))
    return data
  }

  const updateUserStatus = async (userId: string, status: UserStatus, role?: UserRole) => {
    setUpdating(userId)
    try {
      const updateData: Database['public']['Tables']['user_profiles']['Update'] = {
        status,
        approved_by: currentUserId,
        approved_at: new Date().toISOString(),
      }
      
      if (role) {
        updateData.role = role
      }

      await patchUser(userId, { status, role })

      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status, role: role || user.role, approved_by: currentUserId, approved_at: updateData.approved_at || null }
          : user
      ))
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user status')
    } finally {
      setUpdating(null)
    }
  }

  const normalizedSearch = search.trim().toLowerCase()
  const filteredUsers = normalizedSearch
    ? users.filter(u => {
        const haystack = `${u.full_name || ''} ${u.email} ${u.role} ${u.status}`.toLowerCase()
        return haystack.includes(normalizedSearch)
      })
    : users

  const pendingUsers = filteredUsers.filter(u => u.status === 'pending')
  const approvedUsers = filteredUsers.filter(u => u.status === 'approved')
  const rejectedUsers = filteredUsers.filter(u => u.status === 'rejected')

  const openEdit = async (user: User) => {
    setEditingUser(user)
    setEditFullName(user.full_name || '')
    setEditRole(user.role)
    setEditStatus(user.status)
    setEditSiteIds(new Set())
    setAvailableFilter('')
    setAssignedFilter('')
    setSelectedAvailable(new Set())
    setSelectedAssigned(new Set())
    setEditOpen(true)

    setLoadingAccess(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'GET' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(formatApiError(data, 'Failed to load user'))
      const siteIds: string[] = Array.isArray(data.siteIds) ? data.siteIds : []
      setEditSiteIds(new Set(siteIds))
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'Failed to load user access')
    } finally {
      setLoadingAccess(false)
    }
  }

  const availableSites = sites.filter(s => !editSiteIds.has(s.id))
  const assignedSites = sites.filter(s => editSiteIds.has(s.id))

  const filteredAvailable = (() => {
    const q = availableFilter.trim().toLowerCase()
    if (!q) return availableSites
    return availableSites.filter(s => s.name.toLowerCase().includes(q))
  })()

  const filteredAssigned = (() => {
    const q = assignedFilter.trim().toLowerCase()
    if (!q) return assignedSites
    return assignedSites.filter(s => s.name.toLowerCase().includes(q))
  })()

  const moveToAssigned = () => {
    setEditSiteIds(prev => {
      const next = new Set(prev)
      for (const id of selectedAvailable) next.add(id)
      return next
    })
    setSelectedAvailable(new Set())
  }

  const moveToAvailable = () => {
    setEditSiteIds(prev => {
      const next = new Set(prev)
      for (const id of selectedAssigned) next.delete(id)
      return next
    })
    setSelectedAssigned(new Set())
  }

  const assignAllFiltered = () => {
    setEditSiteIds(prev => {
      const next = new Set(prev)
      for (const s of filteredAvailable) next.add(s.id)
      return next
    })
    setSelectedAvailable(new Set())
  }

  const removeAllFiltered = () => {
    setEditSiteIds(prev => {
      const next = new Set(prev)
      for (const s of filteredAssigned) next.delete(s.id)
      return next
    })
    setSelectedAssigned(new Set())
  }

  const saveEdit = async () => {
    if (!editingUser) return
    setUpdating(editingUser.id)
    try {
      await patchUser(editingUser.id, {
        full_name: editFullName,
        role: editRole,
        status: editStatus,
        siteIds: Array.from(editSiteIds),
      })

      setUsers(prev =>
        prev.map(u =>
          u.id === editingUser.id
            ? {
                ...u,
                full_name: editFullName.trim() || null,
                role: editRole,
                status: editStatus,
                ...(u.status !== editStatus
                  ? { approved_by: currentUserId, approved_at: new Date().toISOString() }
                  : {}),
              }
            : u
        )
      )
      setEditOpen(false)
      setEditingUser(null)
      router.refresh()
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'Failed to save changes')
    } finally {
      setUpdating(null)
    }
  }

  const deleteUser = async (user: User) => {
    if (user.id === currentUserId) {
      alert('You cannot delete your own account')
      return
    }
    const ok = window.confirm(`Delete ${user.full_name || user.email}? This cannot be undone.`)
    if (!ok) return

    setUpdating(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(formatApiError(data, 'Failed to delete user'))
      setUsers(prev => prev.filter(u => u.id !== user.id))
      router.refresh()
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'Failed to delete user')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex-1">
          <Label htmlFor="user-search" className="text-gray-700">Search users</Label>
          <Input
            id="user-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, role, status..."
            className="mt-2 rounded-xl border-gray-200"
          />
        </div>
        <div className="text-xs text-gray-500 mt-1 sm:mt-6">
          Signed in as <span className="font-medium">{currentUserRole}</span>
        </div>
      </div>

      {/* Pending Users */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-[#1e3a8a]">
          Pending Approval ({pendingUsers.length})
        </h2>
        {pendingUsers.length > 0 ? (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="ios-card border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 mb-1 truncate">{user.full_name || user.email}</p>
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Registered: {new Date(user.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3">
                  <select
                    value={user.role}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole
                      setUsers(prev => prev.map(u => 
                        u.id === user.id ? { ...u, role: newRole } : u
                      ))
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                    disabled={updating === user.id}
                  >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="flex gap-2 sm:gap-0">
                    <Button
                      size="sm"
                      onClick={() => updateUserStatus(user.id, 'approved', user.role)}
                      disabled={updating === user.id}
                      className="flex-1 sm:flex-none bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-xl shadow-sm text-sm"
                    >
                      {updating === user.id ? '...' : 'Approve'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateUserStatus(user.id, 'rejected')}
                      disabled={updating === user.id}
                      className="flex-1 sm:flex-none bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm"
                    >
                      {updating === user.id ? '...' : 'Reject'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(user)}
                      disabled={updating === user.id}
                      className="flex-1 sm:flex-none border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteUser(user)}
                      disabled={updating === user.id || user.id === currentUserId}
                      className="flex-1 sm:flex-none bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No pending users</p>
        )}
      </div>

      {/* Approved Users */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-[#1e3a8a]">
          Approved Users ({approvedUsers.length})
        </h2>
        {approvedUsers.length > 0 ? (
          <div className="space-y-4">
            {approvedUsers.map((user) => (
              <div
                key={user.id}
                className="ios-card border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 mb-1">
                    <span className="truncate block sm:inline">{user.full_name || user.email}</span>
                    <span className="ml-0 sm:ml-3 mt-1 sm:mt-0 inline-block text-xs px-2.5 py-1 bg-[#1e3a8a]/10 text-[#1e3a8a] rounded-full border border-[#1e3a8a]/20">
                      {user.role}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  {user.approved_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Approved: {new Date(user.approved_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(user)}
                    disabled={updating === user.id}
                    className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteUser(user)}
                    disabled={updating === user.id || user.id === currentUserId}
                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No approved users</p>
        )}
      </div>

      {/* Rejected Users */}
      {rejectedUsers.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-[#1e3a8a]">
            Rejected Users ({rejectedUsers.length})
          </h2>
          <div className="space-y-4">
            {rejectedUsers.map((user) => (
              <div
                key={user.id}
                className="ios-card border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 opacity-60 hover:opacity-80 transition-opacity"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user.full_name || user.email}</p>
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateUserStatus(user.id, 'approved')}
                    disabled={updating === user.id}
                    className="w-full sm:w-auto border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl"
                  >
                    {updating === user.id ? '...' : 'Approve'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(user)}
                    disabled={updating === user.id}
                    className="w-full sm:w-auto border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteUser(user)}
                    disabled={updating === user.id || user.id === currentUserId}
                    className="w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>
              Update user details and project access. Admins/managers automatically have access to all projects.
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <div className="font-medium text-gray-900">{editingUser.email}</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-full-name" className="text-gray-700">Full name</Label>
                <Input
                  id="edit-full-name"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Full name"
                  className="rounded-xl border-gray-200"
                  disabled={updating === editingUser.id}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-gray-700">Role</Label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                    disabled={updating === editingUser.id}
                  >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Status</Label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as UserStatus)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                    disabled={updating === editingUser.id}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Project access</Label>
                {editRole === 'admin' || editRole === 'manager' ? (
                  <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3">
                    This user is <span className="font-medium">{editRole}</span> and will have access to <span className="font-medium">all projects</span>.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {loadingAccess ? (
                      <div className="text-sm text-gray-500 p-2">Loading access...</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
                        <div className="border border-gray-200 rounded-xl p-2 bg-white flex flex-col">
                          <div className="text-xs font-medium text-gray-700 px-1 pb-2">Available projects</div>
                          <Input
                            value={availableFilter}
                            onChange={(e) => setAvailableFilter(e.target.value)}
                            placeholder="Filter..."
                            className="rounded-xl border-gray-200 mb-2"
                            disabled={updating === editingUser.id}
                          />
                          <div className="flex-1 min-h-[180px] max-h-60 overflow-auto space-y-1">
                            {filteredAvailable.length === 0 ? (
                              <div className="text-sm text-gray-500 p-2">No items</div>
                            ) : (
                              filteredAvailable.map(site => (
                                <label
                                  key={site.id}
                                  className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedAvailable.has(site.id)}
                                    onChange={() =>
                                      setSelectedAvailable(prev => {
                                        const next = new Set(prev)
                                        if (next.has(site.id)) next.delete(site.id)
                                        else next.add(site.id)
                                        return next
                                      })
                                    }
                                    disabled={updating === editingUser.id}
                                  />
                                  <span className="text-sm text-gray-900">{site.name}</span>
                                </label>
                              ))
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-2 px-1">
                            {filteredAvailable.length} shown
                          </div>
                        </div>

                        <div className="flex flex-col justify-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={moveToAssigned}
                            disabled={updating === editingUser.id || selectedAvailable.size === 0}
                            className="rounded-xl"
                          >
                            Add →
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={moveToAvailable}
                            disabled={updating === editingUser.id || selectedAssigned.size === 0}
                            className="rounded-xl"
                          >
                            ← Remove
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={assignAllFiltered}
                            disabled={updating === editingUser.id || filteredAvailable.length === 0}
                            className="rounded-xl"
                          >
                            Add all
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={removeAllFiltered}
                            disabled={updating === editingUser.id || filteredAssigned.length === 0}
                            className="rounded-xl"
                          >
                            Remove all
                          </Button>
                        </div>

                        <div className="border border-gray-200 rounded-xl p-2 bg-white flex flex-col">
                          <div className="text-xs font-medium text-gray-700 px-1 pb-2">Assigned projects</div>
                          <Input
                            value={assignedFilter}
                            onChange={(e) => setAssignedFilter(e.target.value)}
                            placeholder="Filter..."
                            className="rounded-xl border-gray-200 mb-2"
                            disabled={updating === editingUser.id}
                          />
                          <div className="flex-1 min-h-[180px] max-h-60 overflow-auto space-y-1">
                            {filteredAssigned.length === 0 ? (
                              <div className="text-sm text-gray-500 p-2">No items</div>
                            ) : (
                              filteredAssigned.map(site => (
                                <label
                                  key={site.id}
                                  className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedAssigned.has(site.id)}
                                    onChange={() =>
                                      setSelectedAssigned(prev => {
                                        const next = new Set(prev)
                                        if (next.has(site.id)) next.delete(site.id)
                                        else next.add(site.id)
                                        return next
                                      })
                                    }
                                    disabled={updating === editingUser.id}
                                  />
                                  <span className="text-sm text-gray-900">{site.name}</span>
                                </label>
                              ))
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-2 px-1">
                            {filteredAssigned.length} shown
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Assigned: {editSiteIds.size}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditOpen(false)}
              className="rounded-xl"
              disabled={editingUser ? updating === editingUser.id : false}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={saveEdit}
              className="rounded-xl bg-[#1e3a8a] hover:bg-[#1e40af] text-white"
              disabled={!editingUser || (editingUser ? updating === editingUser.id : true)}
            >
              {editingUser && updating === editingUser.id ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


