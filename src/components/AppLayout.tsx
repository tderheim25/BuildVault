import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  children: ReactNode
  userRole: 'admin' | 'manager' | 'staff'
}

export function AppLayout({ children, userRole }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <Sidebar userRole={userRole} />
      <main className="ml-72">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

