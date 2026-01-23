'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Building2,
  Plus,
  Camera
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  userRole: 'admin' | 'manager' | 'staff'
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const isAdminOrManager = userRole === 'admin' || userRole === 'manager'

  const navItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/projects',
      label: 'All Projects',
      icon: FolderKanban,
    },
    {
      href: '/capture',
      label: 'Capture',
      icon: Camera,
    },
    ...(isAdminOrManager
      ? [
          {
            href: '/admin/users',
            label: 'Manage Users',
            icon: Users,
          },
        ]
      : []),
  ]

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 bg-white border-r border-gray-200 dashboard-shadow">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center border-b border-gray-100 px-6 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary shadow-lg group-hover:shadow-xl transition-all duration-200">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">
              BuildVault
            </span>
          </Link>
        </div>

        {/* Navigation - scrollable */}
        <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto min-h-0">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname?.startsWith(item.href))

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 h-12 text-base font-medium rounded-xl transition-all duration-200',
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md' 
                    : 'text-gray-700 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 active:bg-red-100'
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive ? 'text-white' : 'text-gray-600')} />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section - always visible at bottom */}
        <div className="flex-shrink-0 border-t border-gray-100 mt-auto">
          {/* Current Projects Card */}
          <div className="px-4 py-4">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl p-4 text-white">
              <p className="text-xs font-medium opacity-90 mb-1">CURRENT PROJECTS</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>

          {/* New Project Button (for admins/managers) */}
          {isAdminOrManager && (
            <div className="border-t border-gray-100 px-4 py-4">
              <Link href="/projects/new">
                <Button className="w-full gap-2 h-12 gradient-primary hover:opacity-90 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 dashboard-button">
                  <Plus className="h-5 w-5" />
                  New Project
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

