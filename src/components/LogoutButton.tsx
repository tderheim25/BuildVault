'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <Button 
      onClick={handleLogout} 
      variant="ghost" 
      className="w-full justify-start gap-3 h-12 text-base font-medium text-gray-700 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 active:bg-red-100 rounded-xl transition-all duration-200"
      type="button"
    >
      <LogOut className="h-5 w-5 text-gray-600" />
      <span className="font-medium">Logout</span>
    </Button>
  )
}


