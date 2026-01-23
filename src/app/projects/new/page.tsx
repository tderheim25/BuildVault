'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AppLayout } from '@/components/AppLayout'

export default function NewProjectPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'staff'>('staff')
  const [userName, setUserName] = useState<string>('User')
  const [userEmail, setUserEmail] = useState<string>('')
  const [projectCount, setProjectCount] = useState<number>(0)

  useEffect(() => {
    const fetchUserRole = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role, full_name, email')
          .eq('id', user.id)
          .single()
        if (profile) {
          setUserRole(profile.role as 'admin' | 'manager' | 'staff')
          setUserName(profile.full_name || 'User')
          setUserEmail(profile.email || user.email || '')
        }

        // Fetch project count
        const { count } = await supabase
          .from('sites')
          .select('*', { count: 'exact', head: true })
        setProjectCount(count || 0)
      }
    }
    fetchUserRole()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { error: insertError } = await supabase
        .from('sites')
        .insert({
          name,
          description: description || null,
          address: address || null,
          created_by: user.id,
        })

      if (insertError) throw insertError

      router.push('/projects')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout userRole={userRole} userName={userName} userEmail={userEmail} projectCount={projectCount}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-[#1e3a8a]">
            Create New Project
          </h1>
          <p className="text-gray-600 text-lg">Add a new construction site/project</p>
        </div>
        <Card className="ios-card ios-shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-[#1e3a8a]">Project Details</CardTitle>
            <CardDescription className="text-gray-600">Fill in the information below</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Project Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Pool & Spa Project - Main Street"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl border-gray-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-[100px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/20 focus-visible:ring-offset-2 focus-visible:border-[#1e3a8a] disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                  placeholder="Project description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-700">Address</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Main St, City, State"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="rounded-xl border-gray-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]/20"
                />
              </div>
            </CardContent>
            <CardContent className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
              <Link href="/projects">
                <Button type="button" variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ios-button"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </AppLayout>
  )
}


