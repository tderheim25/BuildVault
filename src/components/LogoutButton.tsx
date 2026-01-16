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
      className="w-full justify-start gap-3 h-12 text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-all duration-200"
    >
      <LogOut className="h-5 w-5 text-gray-600" />
      <span>Logout</span>
    </Button>
  )
}


