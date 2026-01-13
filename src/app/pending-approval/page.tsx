'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PendingApprovalPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'pending' | 'rejected' | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('status')
          .eq('id', user.id)
          .single()

        if (profile) {
          setStatus(profile.status as 'pending' | 'rejected')
          
          if (profile.status === 'approved') {
            router.push('/')
            router.refresh()
          }
        }
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5000) // Check every 5 seconds
    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Account Pending Approval</CardTitle>
          <CardDescription>
            {status === 'rejected' 
              ? 'Your account has been rejected' 
              : 'Your account is awaiting approval'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'rejected' ? (
            <p className="text-sm text-gray-600">
              Unfortunately, your account registration has been rejected. Please contact your administrator for more information.
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Thank you for registering! Your account is currently pending approval by a manager or administrator. 
                You will be able to access the app once your account is approved.
              </p>
              <p className="text-sm text-gray-500">
                This page will automatically refresh when your account is approved.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


