'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Twitter, Mail, Rss, Github, Check, AlertCircle } from 'lucide-react'
import SageLogo from './SageLogo'
import { useSubscribe } from '@/hooks/useSubscribe'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/stories', label: 'Stories' },
  { href: '/tech', label: 'Tech' },
  { href: '/insights', label: 'Insights' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'All Writing' },
]

const socialLinks = [
  { href: 'https://twitter.com', icon: Twitter, label: 'Twitter / X' },
  { href: 'mailto:hello@sagenarrative.com', icon: Mail, label: 'Email' },
  { href: '/rss.xml', icon: Rss, label: 'RSS Feed' },
  { href: 'https://github.com', icon: Github, label: 'GitHub' },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const { state, subscribe } = useSubscribe()

  const isLoading = state.status === 'loading'
  const isSuccess = state.status === 'success'
  const isError = state.status === 'error'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await subscribe(email, 'footer')
    if (state.status !== 'error') setEmail('')
  }

  return (
    <footer className="border-t border-[#e0e5d2] dark:border-[#2d3226] bg-[var(--background)] mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand col */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center" aria-label="Sage Narrative — home">
              <SageLogo variant="full" height={52} />
            </Link>
            <p className="mt-3 text-sm text-[#464841] dark:text-[#c6c7be] leading-relaxed max-w-[260px]">
              A publication at the intersection of technology, culture, and the
              examined human experience.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-2 mt-5">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={label}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[#ebf0dd] dark:bg-[#2d3226] text-[#5b6300] dark:text-[#c2cf47] hover:bg-[#d3e056] dark:hover:bg-[#3d4530] transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav col */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#767870] dark:text-[#464841] mb-4">
              Navigate
            </h3>
            <ul className="space-y-2.5">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-[#464841] dark:text-[#c6c7be] hover:text-[#5b6300] dark:hover:text-[#c2cf47] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter mini col */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#767870] dark:text-[#464841] mb-4">
              Stay in the loop
            </h3>
            <p className="text-sm text-[#464841] dark:text-[#c6c7be] leading-relaxed mb-4">
              Weekly dispatches on technology, narrative, and things worth thinking about.
            </p>

            {!isSuccess ? (
              <>
                <form className="flex gap-2" onSubmit={handleSubmit}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={isLoading}
                    className="flex-1 min-w-0 text-sm px-4 py-2 rounded-full border border-[#c6c7be] dark:border-[#464841] bg-white dark:bg-[#1c2217] text-[#181d12] dark:text-[#f7fce9] placeholder:text-[#767870] dark:placeholder:text-[#464841] focus:outline-none focus:border-[#5b6300] dark:focus:border-[#c2cf47] transition-colors disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#5b6300] text-white text-sm font-medium hover:bg-[#4a5100] transition-colors disabled:opacity-70"
                  >
                    {isLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Join'
                    )}
                  </button>
                </form>

                {/* Inline error */}
                {isError && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-red-500 dark:text-[#fbbf24]">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {state.message}
                  </p>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-[#5b6300] dark:text-[#c2cf47]">
                <div className="w-4 h-4 rounded-full bg-[#5b6300] dark:bg-[#c2cf47] flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-white dark:text-[#3d4500]" />
                </div>
                <span>{state.message || 'Subscribed!'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#e0e5d2] dark:border-[#2d3226] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#767870] dark:text-[#464841]">
            &copy; {currentYear} Sage Narrative. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-xs text-[#767870] dark:text-[#464841] hover:text-[#5b6300] dark:hover:text-[#c2cf47] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-[#767870] dark:text-[#464841] hover:text-[#5b6300] dark:hover:text-[#c2cf47] transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/studio"
              className="text-xs text-[#767870] dark:text-[#464841] hover:text-[#5b6300] dark:hover:text-[#c2cf47] transition-colors"
            >
              CMS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
