'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function PendingApprovalPage() {
  const [status, setStatus] = useState<'pending' | 'rejected' | 'approved' | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('status, role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        setError(profileError.message)
        setLoading(false)
        return
      }

      if (profile) {
        const profileStatus = profile.status as 'pending' | 'rejected' | 'approved'
        setStatus(profileStatus)
        
        if (profileStatus === 'approved') {
          // Immediately redirect - no delay
          window.location.href = '/'
        }
      }
    } catch (err: any) {
      console.error('Error in checkStatus:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check immediately on mount
    checkStatus()
    // Then check every 3 seconds
    const interval = setInterval(checkStatus, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md ios-card ios-shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-[#1e3a8a]">Account Pending Approval</CardTitle>
          <CardDescription className="text-gray-600">
            {status === 'rejected' 
              ? 'Your account has been rejected' 
              : status === 'approved'
              ? 'Your account is approved! Redirecting...'
              : 'Your account is awaiting approval'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
              Error: {error}
            </div>
          )}
          
          {status === 'rejected' ? (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm text-gray-700">
                Unfortunately, your account registration has been rejected. Please contact your administrator for more information.
              </p>
            </div>
          ) : status === 'approved' ? (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1e3a8a]/10 mb-4">
                <svg className="w-8 h-8 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-[#1e3a8a] font-semibold">
                ✓ Your account has been approved! Redirecting you now...
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ios-button"
              >
                Go to Home Page
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1e3a8a]/10 mb-4">
                <RefreshCw className={`w-8 h-8 text-[#1e3a8a] ${loading ? 'animate-spin' : ''}`} />
              </div>
              <p className="text-sm text-gray-700">
                Thank you for registering! Your account is currently pending approval by a manager or administrator. 
                You will be able to access the app once your account is approved.
              </p>
              <p className="text-sm text-gray-500">
                This page will automatically refresh when your account is approved.
              </p>
              <Button 
                onClick={checkStatus} 
                disabled={loading}
                className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl"
                variant="outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Checking...' : 'Check Status Now'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


