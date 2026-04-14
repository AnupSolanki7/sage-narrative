'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, PenSquare, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Overview', href: '/dashboard',          icon: LayoutDashboard, exact: true  },
  { label: 'Posts',    href: '/dashboard/posts',     icon: FileText,        exact: false },
  { label: 'New',      href: '/dashboard/posts/new', icon: PenSquare,       exact: true  },
  { label: 'Settings', href: '/dashboard/settings',  icon: Settings,        exact: true  },
]

export default function DashboardMobileNav() {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#1c2217] border-t border-[#e0e5d2] dark:border-[#2d3226] flex items-stretch safe-area-pb">
      {navItems.map(({ label, href, icon: Icon, exact }) => {
        const isMyPosts = href === '/dashboard/posts'
        const active = isMyPosts
          ? pathname.startsWith('/dashboard/posts') && pathname !== '/dashboard/posts/new'
          : exact
            ? pathname === href
            : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors',
              active
                ? 'text-[#5b6300] dark:text-[#c2cf47]'
                : 'text-[#767870] dark:text-[#464841]'
            )}
          >
            <Icon className={cn('w-5 h-5', active && 'stroke-[2.5px]')} />
            {label}
          </Link>
        )
      })}

      {/* Sign out */}
      <button
        onClick={handleLogout}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium text-[#767870] dark:text-[#464841] hover:text-red-500 dark:hover:text-red-400 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Sign out
      </button>
    </nav>
  )
}
