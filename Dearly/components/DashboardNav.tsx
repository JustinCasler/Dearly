'use client'

import { useRouter, usePathname } from 'next/navigation'
import { signOut } from '@/lib/auth'
import Link from 'next/link'

interface DashboardNavProps {
  userRole: 'admin' | 'interviewer' | 'customer'
  userName: string
}

export default function DashboardNav({ userRole, userName }: DashboardNavProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      // Error handled silently
    }
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(path)
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
              Dearly
            </Link>

            {/* Admin Navigation */}
            {userRole === 'admin' && (
              <>
                <Link
                  href="/dashboard"
                  className={`transition ${
                    isActive('/dashboard') && !pathname.includes('/sessions/')
                      ? 'text-indigo-600 font-semibold'
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  Sessions
                </Link>
                <Link
                  href="/dashboard/availability"
                  className={`transition ${
                    isActive('/dashboard/availability')
                      ? 'text-indigo-600 font-semibold'
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  Availability
                </Link>
              </>
            )}

            {/* Interviewer Navigation */}
            {userRole === 'interviewer' && (
              <>
                <Link
                  href="/dashboard/interviewer"
                  className={`transition ${
                    pathname === '/dashboard/interviewer'
                      ? 'text-indigo-600 font-semibold'
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  My Sessions
                </Link>
                <Link
                  href="/dashboard/interviewer/available"
                  className={`transition ${
                    isActive('/dashboard/interviewer/available')
                      ? 'text-indigo-600 font-semibold'
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  Available Sessions
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {userName} <span className="text-xs text-gray-400">({userRole})</span>
            </span>
            <button
              onClick={handleSignOut}
              className="text-gray-700 hover:text-indigo-600 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
