import { createServerClient, supabaseAdmin } from '@/lib/supabase/server'
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

  // Get user role using admin client to bypass RLS
  // (RLS policies on users table create circular dependency)
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('role, name')
    .eq('id', user.id)
    .single() as { data: { role: string; name: string } | null; error: any }

  if (userError || !userData) {
    redirect('/login')
  }

  const userRole = userData.role as 'customer' | 'interviewer' | 'admin'

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav userRole={userRole} userName={userData.name} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

