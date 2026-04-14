'use client'

import { useState } from 'react'
import { Mail, Check, ArrowRight, Sparkles } from 'lucide-react'

export default function StickySubscribeCard() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="relative rounded-[1.25rem] overflow-hidden bg-[#181d12] dark:bg-[#0d1109]">
      {/* Subtle radial depth layer */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(211,224,86,0.08)_0%,_transparent_65%)]" />
      {/* Faint top accent line */}
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#d3e056]/30 to-transparent" />

      <div className="relative px-6 py-7 text-center">
        {/* Icon badge */}
        <div className="inline-flex items-center gap-1.5 bg-[#d3e056]/10 border border-[#d3e056]/20 rounded-full px-3 py-1.5 mb-5">
          <Sparkles className="w-3 h-3 text-[#c2cf47]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#c2cf47]">
            Weekly essays
          </span>
        </div>

        {/* Heading */}
        <h3 className="font-serif font-bold text-xl text-[#f7fce9] leading-snug mb-2">
          Deep Insights Weekly
        </h3>

        {/* Supporting text */}
        <p className="text-[#8a9080] text-sm leading-relaxed mb-6">
          Essays on technology and the examined life. Thoughtfully curated, one per week.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white/8 border border-white/12 text-[#f7fce9] placeholder:text-white/25 focus:outline-none focus:border-[#d3e056]/40 focus:bg-white/12 transition-all text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#d3e056] text-[#3d4500] font-semibold text-sm hover:bg-[#dcea5e] hover:shadow-[0_0_16px_rgba(211,224,86,0.25)] transition-all duration-200 active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#4a5200]/40 border-t-[#4a5200] rounded-full animate-spin" />
                  Joining…
                </>
              ) : (
                <>
                  Subscribe free
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-2.5 bg-white/8 border border-white/10 rounded-full px-4 py-3">
            <div className="w-5 h-5 rounded-full bg-[#d3e056] flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-[#3d4500]" />
            </div>
            <span className="text-[#f7fce9] text-sm font-medium">You&apos;re in. Welcome!</span>
          </div>
        )}

        {/* Trust line */}
        <p className="mt-4 text-white/20 text-xs">
          Join thoughtful readers &mdash; unsubscribe anytime.
        </p>
      </div>
    </div>
  )
}
