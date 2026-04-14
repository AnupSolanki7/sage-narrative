'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, PenSquare, Settings, LogOut, BookOpen, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Overview',  href: '/dashboard',           icon: LayoutDashboard, exact: true  },
  { label: 'My Posts',  href: '/dashboard/posts',      icon: FileText,        exact: false },
  { label: 'New Post',  href: '/dashboard/posts/new',  icon: PenSquare,       exact: true  },
  { label: 'Settings',  href: '/dashboard/settings',   icon: Settings,        exact: true  },
]

interface DashboardNavProps {
  userName?: string
  username?: string
  avatar?: string
}

export default function DashboardNav({ userName, username, avatar }: DashboardNavProps) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex flex-col fixed top-0 left-0 h-full w-60 bg-white dark:bg-[#1c2217] border-r border-[#e0e5d2] dark:border-[#2d3226] z-40">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-[#e0e5d2] dark:border-[#2d3226]">
        <Link href="/" className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-[#5b6300] dark:text-[#c2cf47]" />
          <span className="font-serif italic font-bold text-lg text-[#181d12] dark:text-[#f7fce9]">
            Sage Narrative
          </span>
        </Link>
        <p className="text-xs text-[#767870] dark:text-[#464841] mt-1 ml-7">Writer Dashboard</p>
      </div>

      {/* User badge */}
      {userName && (
        <div className="px-4 py-3 border-b border-[#e0e5d2] dark:border-[#2d3226]">
          <div className="flex items-center gap-2.5 px-2">
            {avatar ? (
              <img src={avatar} alt={userName} className="w-7 h-7 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#ebf0dd] dark:bg-[#2d3226] flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-[#5b6300] dark:text-[#c2cf47]" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#181d12] dark:text-[#f7fce9] truncate">{userName}</p>
              {username && (
                <p className="text-xs text-[#767870] dark:text-[#464841] truncate">@{username}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href) && pathname !== '/dashboard/posts/new'
          // Special case: "My Posts" should not be active when on /new
          const isMyPostsActive = href === '/dashboard/posts' && pathname.startsWith('/dashboard/posts') && pathname !== '/dashboard/posts/new'
          const finalActive = href === '/dashboard/posts' ? isMyPostsActive : (exact ? pathname === href : pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[0.75rem] text-sm font-medium transition-all',
                finalActive
                  ? 'bg-[#ebf0dd] dark:bg-[#2d3226] text-[#5b6300] dark:text-[#c2cf47]'
                  : 'text-[#464841] dark:text-[#c6c7be] hover:bg-[#f1f6e3] dark:hover:bg-[#2d3226]/50 hover:text-[#181d12] dark:hover:text-[#f7fce9]'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[#e0e5d2] dark:border-[#2d3226] space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-[0.75rem] text-sm text-[#464841] dark:text-[#c6c7be] hover:bg-[#f1f6e3] dark:hover:bg-[#2d3226]/50 transition-all"
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          View site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[0.75rem] text-sm text-[#464841] dark:text-[#c6c7be] hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
