'use client'

import { ReactNode, useState } from 'react'
import { Sidebar, MobileMenuButton } from './Sidebar'
import { UserMenu } from './UserMenu'

interface AppLayoutProps {
  children: ReactNode
  userRole: 'admin' | 'manager' | 'staff'
  userName: string
  userEmail: string
  projectCount?: number
}

export function AppLayout({ children, userRole, userName, userEmail, projectCount = 0 }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <Sidebar 
        userRole={userRole} 
        projectCount={projectCount}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      <main className="lg:ml-72">
        {/* Header with User Menu */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <MobileMenuButton onClick={() => setIsMobileMenuOpen(true)} />
            <UserMenu 
              userName={userName}
              userEmail={userEmail}
              userRole={userRole}
            />
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4 mt-auto">
          <div className="text-center text-sm text-gray-600">
            BuildVault © 2026 DerheimInc
          </div>
        </footer>
      </main>
    </div>
  )
}

