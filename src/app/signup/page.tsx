'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      setSuccess(true)
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md ios-card ios-shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-[#1e3a8a]">Registration Successful</CardTitle>
            <CardDescription className="text-gray-600">Your account is pending approval</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-6">
              Your account has been created successfully. A manager or admin will review your registration and approve your account. You will be able to access the app once your account is approved.
            </p>
            <Link href="/login">
              <Button className="w-full bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ios-button">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#1e3a8a] rounded-3xl shadow-sm mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-3 text-[#1e3a8a]">
            Join BuildVault
          </h1>
          <p className="text-gray-600 text-lg">Create your account to get started</p>
        </div>
        <Card className="ios-card ios-shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-[#1e3a8a]">Sign Up</CardTitle>
            <CardDescription className="text-gray-600">Create a new BuildVault account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-5">
              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-700">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="rounded-xl border-gray-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl border-gray-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="rounded-xl border-gray-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]/20"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button 
                type="submit" 
                className="w-full h-12 bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ios-button" 
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
              <div className="text-sm text-center text-gray-600 pt-2">
                Already have an account?{' '}
                <Link href="/login" className="text-[#1e3a8a] hover:text-[#1e40af] font-semibold hover:underline transition-colors">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}


