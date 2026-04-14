'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Invalid credentials')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7fce9] dark:bg-[#181d12] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <h1 className="font-serif italic text-3xl font-bold text-[#181d12] dark:text-[#f7fce9] mb-1">
            Sage Narrative
          </h1>
          <p className="text-sm text-[#767870] dark:text-[#464841]">Admin CMS</p>
        </div>

        <div className="bg-white dark:bg-[#1c2217] rounded-[2rem] border border-[#e0e5d2] dark:border-[#2d3226] p-8 shadow-card">
          <h2 className="font-serif font-bold text-2xl text-[#181d12] dark:text-[#f7fce9] mb-6">
            Sign in
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#464841] dark:text-[#c6c7be] mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-[#e0e5d2] dark:border-[#2d3226] bg-[#f7fce9] dark:bg-[#2d3226] text-[#181d12] dark:text-[#f7fce9] px-5 py-3 text-sm outline-none focus:border-[#5b6300] dark:focus:border-[#c2cf47] transition-colors placeholder:text-[#767870]"
                placeholder="admin@sagenarrative.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#464841] dark:text-[#c6c7be] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-full border border-[#e0e5d2] dark:border-[#2d3226] bg-[#f7fce9] dark:bg-[#2d3226] text-[#181d12] dark:text-[#f7fce9] px-5 py-3 pr-12 text-sm outline-none focus:border-[#5b6300] dark:focus:border-[#c2cf47] transition-colors placeholder:text-[#767870]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#767870] hover:text-[#464841] dark:hover:text-[#c6c7be]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5b6300] text-white rounded-full py-3 font-semibold text-sm transition-all hover:bg-[#4a5100] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
