import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getUserById } from '@/lib/db/users'
import DashboardNav from '@/components/dashboard/DashboardNav'
import DashboardMobileNav from '@/components/dashboard/DashboardMobileNav'

export const metadata: Metadata = {
  title: 'Dashboard — Sage Narrative',
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session.isLoggedIn || !session.userId) {
    redirect('/login?next=/dashboard')
  }

  // Fetch user for nav display (non-fatal)
  let userName: string | undefined
  let username: string | undefined
  let avatar: string | undefined

  try {
    const user = await getUserById(session.userId)
    if (user) {
      userName = user.name
      username = user.username
      avatar   = user.avatar
    }
  } catch {}

  return (
    <div className="min-h-screen bg-[#f1f6e3] dark:bg-[#181d12] flex">
      <DashboardNav userName={userName} username={username} avatar={avatar} />
      <main className="flex-1 min-w-0 p-4 md:p-8 lg:p-10 ml-0 md:ml-60 pb-24 md:pb-10">
        {children}
      </main>
      <DashboardMobileNav />
    </div>
  )
}
