'use client'

import { useState } from 'react'
import { Mail, ArrowRight, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSubscribe } from '@/hooks/useSubscribe'
import type { SubscriberSource } from '@/models/Subscriber'

interface NewsletterSectionProps {
  title?: string
  description?: string
  className?: string
  source?: SubscriberSource
}

export default function NewsletterSection({
  title = 'Deep Insights Weekly',
  description = 'Join over 12,000 thoughtful readers who receive our curated dispatches on technology, human narrative, and the examined life. No noise. No filler. Only essays worth your time.',
  className,
  source = 'homepage',
}: NewsletterSectionProps) {
  const [email, setEmail] = useState('')
  const { state, subscribe } = useSubscribe()

  const isLoading = state.status === 'loading'
  const isSuccess = state.status === 'success'
  const isError = state.status === 'error'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await subscribe(email, source)
    if (state.status !== 'error') setEmail('')
  }

  return (
    <section id="newsletter" className={cn('px-4 md:px-8 py-8', className)}>
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#5b6300] px-8 md:px-16 py-14 md:py-20">
          {/* Background decorative circles */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-black/10 translate-y-1/3 -translate-x-1/4" />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-[#d3e056]/10 -translate-y-1/2" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, #d3e056 1.5px, transparent 1.5px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Content */}
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-[1rem] bg-[#d3e056] mb-6">
              <Mail className="w-5 h-5 text-[#5a6200]" />
            </div>

            {/* Heading */}
            <h2 className="font-serif font-bold text-3xl md:text-5xl text-white mb-4 leading-tight">
              {title}
            </h2>

            {/* Description */}
            <p className="text-white/75 text-base md:text-lg leading-relaxed mb-8 max-w-lg mx-auto">
              {description}
            </p>

            {/* Form */}
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                  className="flex-1 min-w-0 px-5 py-3 rounded-full bg-white/15 border border-white/25 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all text-sm disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 shrink-0 px-6 py-3 rounded-full bg-[#d3e056] text-[#5a6200] font-semibold text-sm hover:bg-[#c2cf47] transition-all active:scale-95 disabled:opacity-70"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#5a6200]/30 border-t-[#5a6200] rounded-full animate-spin" />
                      Joining...
                    </span>
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="inline-flex items-center gap-3 bg-white/15 border border-white/25 rounded-full px-6 py-3">
                <div className="w-5 h-5 rounded-full bg-[#d3e056] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-[#5a6200]" />
                </div>
                <span className="text-white font-medium text-sm">
                  {state.message || "You're subscribed! Welcome to the community."}
                </span>
              </div>
            )}

            {/* Inline error message */}
            {isError && (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[#fde68a] text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {state.message}
              </p>
            )}

            {/* Fine print */}
            {!isSuccess && (
              <p className="mt-4 text-white/40 text-xs">
                No spam. Unsubscribe at any time. One email per week.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
