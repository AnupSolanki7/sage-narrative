'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, BookOpen, Cpu, Lightbulb, Home, User, BookMarked, LayoutDashboard, LogIn, LogOut, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import SageLogo from './SageLogo'

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/stories', label: 'Stories', icon: BookOpen },
  { href: '/tech', label: 'Tech', icon: Cpu },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
  { href: '/blog', label: 'All Writing', icon: BookMarked },
  { href: '/about', label: 'About', icon: User },
]

interface NavUser {
  name: string
  username: string
  avatar?: string
}

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  user?: NavUser | null
  onLogout?: () => void
}

export default function MobileNav({ isOpen, onClose, user, onLogout }: MobileNavProps) {
  const pathname = usePathname()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    onClose()
  }, [pathname])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-[300px] bg-white dark:bg-[#1c2217] shadow-float flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e0e5d2] dark:border-[#2d3226]">
          <Link
            href="/"
            className="shrink-0 flex items-center"
            onClick={onClose}
            aria-label="Sage Narrative — home"
          >
            <SageLogo variant="compact" height={34} />
          </Link>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#ebf0dd] dark:bg-[#2d3226] text-[#464841] dark:text-[#c6c7be] hover:bg-[#d3e056] dark:hover:bg-[#3d4530] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-[1rem] font-medium transition-all text-sm',
                  isActive
                    ? 'bg-[#d3e056] text-[#5a6200]'
                    : 'text-[#464841] dark:text-[#c6c7be] hover:bg-[#ebf0dd] dark:hover:bg-[#2d3226] hover:text-[#181d12] dark:hover:text-[#f7fce9]'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer: auth */}
        <div className="px-4 py-6 border-t border-[#e0e5d2] dark:border-[#2d3226] space-y-2">
          {user ? (
            <>
              {/* User identity */}
              <div className="flex items-center gap-3 px-4 py-2 mb-1">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#ebf0dd] dark:bg-[#2d3226] flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-[#5b6300] dark:text-[#c2cf47]" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#181d12] dark:text-[#f7fce9] truncate">{user.name}</p>
                  <p className="text-xs text-[#767870] dark:text-[#464841] truncate">@{user.username}</p>
                </div>
              </div>
              <Link
                href="/dashboard"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-[1rem] text-sm font-medium text-[#464841] dark:text-[#c6c7be] hover:bg-[#ebf0dd] dark:hover:bg-[#2d3226] transition-all"
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                Dashboard
              </Link>
              <Link
                href={`/author/${user.username}`}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-[1rem] text-sm font-medium text-[#464841] dark:text-[#c6c7be] hover:bg-[#ebf0dd] dark:hover:bg-[#2d3226] transition-all"
              >
                <User className="w-4 h-4 shrink-0" />
                My Profile
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-[1rem] text-sm font-medium text-[#464841] dark:text-[#c6c7be] hover:bg-[#ebf0dd] dark:hover:bg-[#2d3226] transition-all"
              >
                <Settings className="w-4 h-4 shrink-0" />
                Settings
              </Link>
              <button
                onClick={() => { onLogout?.(); onClose() }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-[1rem] text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-[#767870] dark:text-[#464841] px-4 mb-1">
                Join to write and publish stories.
              </p>
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-[1rem] text-sm font-medium text-[#464841] dark:text-[#c6c7be] hover:bg-[#ebf0dd] dark:hover:bg-[#2d3226] transition-all"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                Sign in
              </Link>
              <Link
                href="#newsletter"
                onClick={onClose}
                className="block w-full text-center btn-primary"
              >
                Subscribe &mdash; it&apos;s free
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
