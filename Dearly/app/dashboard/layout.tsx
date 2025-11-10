'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                Dearly
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-indigo-600 transition"
              >
                Sessions
              </Link>
            </div>
            <button
              onClick={handleSignOut}
              className="text-gray-700 hover:text-indigo-600 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

