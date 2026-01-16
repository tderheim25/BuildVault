'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { UserRole, UserStatus } from '@/types/database'

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

interface UserManagementClientProps {
  initialUsers: User[]
  currentUserId: string
}

export function UserManagementClient({ initialUsers, currentUserId }: UserManagementClientProps) {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [updating, setUpdating] = useState<string | null>(null)

  const updateUserStatus = async (userId: string, status: UserStatus, role?: UserRole) => {
    setUpdating(userId)
    try {
      const supabase = createClient()
      
      const updateData: any = {
        status,
        approved_by: currentUserId,
        approved_at: new Date().toISOString(),
      }
      
      if (role) {
        updateData.role = role
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId)

      if (error) throw error

      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status, role: role || user.role, approved_by: currentUserId, approved_at: updateData.approved_at }
          : user
      ))
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user status')
    } finally {
      setUpdating(null)
    }
  }

  const pendingUsers = users.filter(u => u.status === 'pending')
  const approvedUsers = users.filter(u => u.status === 'approved')
  const rejectedUsers = users.filter(u => u.status === 'rejected')

  return (
    <div className="space-y-8">
      {/* Pending Users */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-[#1e3a8a]">
          Pending Approval ({pendingUsers.length})
        </h2>
        {pendingUsers.length > 0 ? (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="ios-card border-gray-200 rounded-xl p-5 flex justify-between items-center hover:shadow-md transition-all duration-200"
              >
                <div>
                  <p className="font-medium text-gray-900 mb-1">{user.full_name || user.email}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Registered: {new Date(user.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
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
                  <Button
                    size="sm"
                    onClick={() => updateUserStatus(user.id, 'approved', user.role)}
                    disabled={updating === user.id}
                    className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-xl shadow-sm"
                  >
                    {updating === user.id ? '...' : 'Approve'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updateUserStatus(user.id, 'rejected')}
                    disabled={updating === user.id}
                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl"
                  >
                    {updating === user.id ? '...' : 'Reject'}
                  </Button>
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
        <h2 className="text-xl font-semibold mb-4 text-[#1e3a8a]">
          Approved Users ({approvedUsers.length})
        </h2>
        {approvedUsers.length > 0 ? (
          <div className="space-y-4">
            {approvedUsers.map((user) => (
              <div
                key={user.id}
                className="ios-card border-gray-200 rounded-xl p-5 flex justify-between items-center hover:shadow-md transition-all duration-200"
              >
                <div>
                  <p className="font-medium text-gray-900 mb-1">
                    {user.full_name || user.email}
                    <span className="ml-3 text-xs px-2.5 py-1 bg-[#1e3a8a]/10 text-[#1e3a8a] rounded-full border border-[#1e3a8a]/20">
                      {user.role}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  {user.approved_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Approved: {new Date(user.approved_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    value={user.role}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole
                      updateUserStatus(user.id, 'approved', newRole)
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                    disabled={updating === user.id}
                  >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
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
          <h2 className="text-xl font-semibold mb-4 text-[#1e3a8a]">
            Rejected Users ({rejectedUsers.length})
          </h2>
          <div className="space-y-4">
            {rejectedUsers.map((user) => (
              <div
                key={user.id}
                className="ios-card border-gray-200 rounded-xl p-5 flex justify-between items-center opacity-60 hover:opacity-80 transition-opacity"
              >
                <div>
                  <p className="font-medium text-gray-900">{user.full_name || user.email}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateUserStatus(user.id, 'approved')}
                  disabled={updating === user.id}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl"
                >
                  {updating === user.id ? '...' : 'Approve'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


