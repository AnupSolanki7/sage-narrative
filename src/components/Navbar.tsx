'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, User, ChevronDown, LayoutDashboard, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import ThemeToggle from './ThemeToggle'
import MobileNav from './MobileNav'

interface NavUser {
  name: string
  username: string
  avatar?: string
}

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/stories', label: 'Stories' },
  { href: '/tech', label: 'Tech' },
  { href: '/insights', label: 'Insights' },
  { href: '/blog', label: 'All Writing' },
  { href: '/about', label: 'About' },
]

export default function Navbar() {
  const pathname   = usePathname()
  const router     = useRouter()
  const [scrolled,     setScrolled]     = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [user,         setUser]         = useState<NavUser | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch auth state
  useEffect(() => {
    fetch('/api/user/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser({ name: data.user.name, username: data.user.username, avatar: data.user.avatar })
        } else {
          setUser(null)
        }
      })
      .catch(() => setUser(null))
  }, [pathname])

  // Close user menu on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setUserMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) return null

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 px-4 md:px-8 pt-4">
        <nav
          className={cn(
            'max-w-7xl mx-auto rounded-full transition-all duration-300',
            'bg-white/90 dark:bg-[#1c2217]/90 backdrop-blur-md',
            'border border-[#e0e5d2] dark:border-[#2d3226]',
            scrolled
              ? 'shadow-premium py-2 px-4'
              : 'shadow-card py-2.5 px-4'
          )}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Logo / Brand */}
            <Link
              href="/"
              className="font-serif italic font-semibold text-lg md:text-xl text-[#181d12] dark:text-[#f7fce9] hover:text-[#5b6300] dark:hover:text-[#c2cf47] transition-colors shrink-0"
            >
              Sage Narrative
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label }) => {
                const isActive =
                  pathname === href ||
                  (href !== '/' && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                      isActive
                        ? 'bg-[#d3e056] text-[#5a6200]'
                        : 'text-[#464841] dark:text-[#c6c7be] hover:bg-[#ebf0dd] dark:hover:bg-[#2d3226] hover:text-[#181d12] dark:hover:text-[#f7fce9]'
                    )}
                  >
                    {label}
                  </Link>
                )
              })}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />

              {/* User menu or Sign in — desktop */}
              {user ? (
                <div className="relative hidden md:block" ref={menuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full border border-[#e0e5d2] dark:border-[#2d3226] px-3 py-1.5 text-sm font-medium text-[#464841] dark:text-[#c6c7be] hover:bg-[#f1f6e3] dark:hover:bg-[#2d3226] transition-colors"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#ebf0dd] dark:bg-[#2d3226] flex items-center justify-center">
                        <User className="w-3 h-3 text-[#5b6300] dark:text-[#c2cf47]" />
                      </div>
                    )}
                    <span className="max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', userMenuOpen && 'rotate-180')} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1c2217] rounded-[1rem] border border-[#e0e5d2] dark:border-[#2d3226] shadow-premium py-1 z-50">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#464841] dark:text-[#c6c7be] hover:bg-[#f7fce9] dark:hover:bg-[#2d3226]/50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        href={`/author/${user.username}`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#464841] dark:text-[#c6c7be] hover:bg-[#f7fce9] dark:hover:bg-[#2d3226]/50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#464841] dark:text-[#c6c7be] hover:bg-[#f7fce9] dark:hover:bg-[#2d3226]/50 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <div className="border-t border-[#e0e5d2] dark:border-[#2d3226] my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-[#5b6300] text-white text-sm font-medium px-4 py-2 transition-all hover:bg-[#4a5100] hover:shadow-premium active:scale-95"
                >
                  Sign in
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden w-9 h-9 rounded-full flex items-center justify-center bg-[#ebf0dd] dark:bg-[#2d3226] text-[#464841] dark:text-[#c6c7be] hover:bg-[#d3e056] dark:hover:bg-[#3d4530] transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} user={user} onLogout={handleLogout} />
    </>
  )
}
