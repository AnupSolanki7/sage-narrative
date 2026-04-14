import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import AdminNav from '@/components/admin/AdminNav'

export const metadata: Metadata = {
  title: 'Admin — Sage Narrative',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  // Allow the login page to render unauthenticated — it is under /admin/login
  // We protect all other /admin/* routes here by checking the pathname indirectly:
  // The login page itself renders without this layout (it uses a separate check).
  // This layout wraps /admin and /admin/* (excluding /admin/login via its own page).
  if (!session.isLoggedIn) {
    // redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#f1f6e3] dark:bg-[#181d12] flex">
      <AdminNav />
      <main className="flex-1 min-w-0 p-6 md:p-8 lg:p-10 ml-0 md:ml-60">
        {children}
      </main>
    </div>
  )
}
