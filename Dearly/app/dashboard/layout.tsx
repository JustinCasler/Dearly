import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardNav from '@/components/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Get user role
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role, name')
    .eq('id', user.id)
    .single<{ role: 'customer' | 'interviewer' | 'admin'; name: string }>()

  if (userError || !userData) {
    redirect('/login')
  }

  const userRole = userData.role

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav userRole={userRole} userName={userData.name} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

