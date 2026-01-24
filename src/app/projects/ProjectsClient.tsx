'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription as ModalDescription,
  DialogFooter,
  DialogHeader as ModalHeader,
  DialogTitle as ModalTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Pencil, Trash2, Building2, Calendar, MapPin, Plus, Search } from 'lucide-react'

type Site = {
  id: string
  name: string
  description: string | null
  address: string | null
  created_at: string
}

export function ProjectsClient({
  sites: initialSites,
  userRole,
}: {
  sites: Site[]
  userRole: 'admin' | 'manager' | 'staff'
}) {
  const router = useRouter()
  const canManage = userRole === 'admin' || userRole === 'manager'

  const [sites, setSites] = useState<Site[]>(initialSites)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openCreate = () => {
    setMode('create')
    setEditingId(null)
    setName('')
    setDescription('')
    setAddress('')
    setError(null)
    setModalOpen(true)
  }

  const openEdit = (site: Site) => {
    setMode('edit')
    setEditingId(site.id)
    setName(site.name)
    setDescription(site.description || '')
    setAddress(site.address || '')
    setError(null)
    setModalOpen(true)
  }

  const submit = async () => {
    if (!canManage) return
    setError(null)
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      if (mode === 'create') {
        const { error: insertError } = await (supabase.from('sites') as any).insert({
          name,
          description: description || null,
          address: address || null,
          created_by: user.id,
        })
        if (insertError) throw insertError
      } else {
        if (!editingId) throw new Error('Missing project id')
        const { error: updateError } = await (supabase.from('sites') as any)
          .update({
            name,
            description: description || null,
            address: address || null,
          })
          .eq('id', editingId)
        if (updateError) throw updateError
      }

      setModalOpen(false)
      // Refresh server data + re-sync local list
      router.refresh()
    } catch (e: any) {
      setError(e?.message || 'Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  const deleteProject = async (site: Site) => {
    if (!canManage) return
    const ok = window.confirm(`Delete "${site.name}"? This cannot be undone.`)
    if (!ok) return

    setSaving(true)
    try {
      const supabase = createClient()
      const { error: delError } = await supabase.from('sites').delete().eq('id', site.id)
      if (delError) throw delError
      setSites(prev => prev.filter(s => s.id !== site.id))
      router.refresh()
    } catch (e: any) {
      alert(e?.message || 'Failed to delete project')
    } finally {
      setSaving(false)
    }
  }

  // Keep local list in sync when server refresh updates props
  // (Next can re-render this component with new props after router.refresh)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => setSites(initialSites), [initialSites])

  const filteredSites = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sites
    return sites.filter(s => 
      s.name.toLowerCase().includes(q) || 
      (s.description?.toLowerCase().includes(q)) ||
      (s.address?.toLowerCase().includes(q))
    )
  }, [sites, search])

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="mb-6 sm:mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-gradient">
            Projects
          </h1>
          <p className="text-gray-600 text-base sm:text-lg mb-6 lg:mb-0">All construction projects</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-stretch sm:items-center">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="pl-10 rounded-xl border-gray-200 bg-white/50 focus:bg-white transition-colors"
            />
          </div>
          {canManage && (
            <Button onClick={openCreate} className="flex items-center gap-2 whitespace-nowrap shadow-sm">
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </Button>
          )}
        </div>
      </div>

      {filteredSites.length > 0 ? (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSites.map((site) => (
            <div key={site.id} className="group relative">
              <Link href={`/projects/${site.id}`} className="block h-full">
                <Card className="h-full border-gray-200 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 overflow-hidden bg-white group/card">
                  <CardHeader className="p-5 sm:p-6 pb-0">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover/card:bg-indigo-600 group-hover/card:text-white transition-all duration-300">
                        <Building2 className="w-6 h-6" />
                      </div>
                      
                      {canManage && (
                        <div className="relative z-10" onClick={(e) => e.preventDefault()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100">
                                <MoreVertical className="h-4 w-4 text-gray-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-gray-100">
                              <DropdownMenuItem 
                                onClick={() => openEdit(site)}
                                className="flex items-center gap-2 py-2.5 cursor-pointer rounded-lg mx-1"
                              >
                                <Pencil className="h-4 w-4 text-gray-500" />
                                <span>Edit details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteProject(site)}
                                className="flex items-center gap-2 py-2.5 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg mx-1"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete project</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover/card:text-indigo-600 transition-colors">
                        {site.name}
                      </CardTitle>
                      {site.description && (
                        <CardDescription className="text-gray-500 mt-2 line-clamp-2 text-sm leading-relaxed">
                          {site.description}
                        </CardDescription>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-5 sm:p-6 pt-4">
                    <div className="flex flex-col gap-2">
                      {site.address && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate">{site.address}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>Created {new Date(site.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-sm mb-4 sm:mb-6">
            <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-200" />
          </div>
          <p className="text-gray-700 text-base sm:text-lg mb-2 font-semibold">
            {search ? 'No matches found' : 'No projects yet'}
          </p>
          <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6 max-w-xs mx-auto">
            {search 
              ? `We couldn't find any projects matching "${search}"` 
              : 'Get started by creating your first construction project'}
          </p>
          {canManage && !search && (
            <Button onClick={openCreate} className="px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base">
              Create Your First Project
            </Button>
          )}
          {search && (
            <Button variant="ghost" onClick={() => setSearch('')} className="text-indigo-600">
              Clear search
            </Button>
          )}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="rounded-2xl">
          <ModalHeader>
            <ModalTitle>{mode === 'create' ? 'New Project' : 'Edit Project'}</ModalTitle>
            <ModalDescription>
              {mode === 'create'
                ? 'Add a new construction site/project.'
                : 'Update project details.'}
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-4">
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-gray-700">Project Name *</Label>
              <Input
                id="project-name"
                type="text"
                placeholder="Pool & Spa Project - Main Street"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-xl border-gray-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]/20"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description" className="text-gray-700">Description</Label>
              <textarea
                id="project-description"
                className="flex min-h-[100px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/20 focus-visible:ring-offset-2 focus-visible:border-[#1e3a8a] disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                placeholder="Project description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-address" className="text-gray-700">Address</Label>
              <Input
                id="project-address"
                type="text"
                placeholder="123 Main St, City, State"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="rounded-xl border-gray-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]/20"
                disabled={saving}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="rounded-xl"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submit}
              className="rounded-xl bg-[#1e3a8a] hover:bg-[#1e40af] text-white"
              disabled={saving || !name.trim()}
            >
              {saving ? 'Saving...' : mode === 'create' ? 'Create Project' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

