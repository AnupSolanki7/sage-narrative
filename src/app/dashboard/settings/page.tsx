'use client'

import { useState, useEffect } from 'react'
import { Loader2, User, Save, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileData {
  name: string
  username: string
  email: string
  bio: string
  avatar: string
  socialLinks: {
    twitter: string
    github: string
    website: string
    linkedin: string
  }
}

const empty: ProfileData = {
  name:     '',
  username: '',
  email:    '',
  bio:      '',
  avatar:   '',
  socialLinks: { twitter: '', github: '', website: '', linkedin: '' },
}

export default function DashboardSettingsPage() {
  const [profile,  setProfile]  = useState<ProfileData>(empty)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  useEffect(() => {
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setProfile({
            name:        data.user.name        ?? '',
            username:    data.user.username    ?? '',
            email:       data.user.email       ?? '',
            bio:         data.user.bio         ?? '',
            avatar:      data.user.avatar      ?? '',
            socialLinks: {
              twitter:  data.user.socialLinks?.twitter  ?? '',
              github:   data.user.socialLinks?.github   ?? '',
              website:  data.user.socialLinks?.website  ?? '',
              linkedin: data.user.socialLinks?.linkedin ?? '',
            },
          })
        }
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)

    try {
      const res = await fetch('/api/user/profile', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:        profile.name        || undefined,
          username:    profile.username    || undefined,
          bio:         profile.bio         || undefined,
          avatar:      profile.avatar      || undefined,
          socialLinks: {
            twitter:  profile.socialLinks.twitter  || undefined,
            github:   profile.socialLinks.github   || undefined,
            website:  profile.socialLinks.website  || undefined,
            linkedin: profile.socialLinks.linkedin || undefined,
          },
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
        // Update username in profile state (server may have sanitised it)
        if (data.user) {
          setProfile((p) => ({ ...p, username: data.user.username }))
        }
      } else {
        setError(data.error ?? 'Failed to save changes.')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  function update(key: keyof ProfileData, value: string) {
    setProfile((p) => ({ ...p, [key]: value }))
  }

  function updateSocial(key: keyof ProfileData['socialLinks'], value: string) {
    setProfile((p) => ({ ...p, socialLinks: { ...p.socialLinks, [key]: value } }))
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-[#5b6300] dark:text-[#c2cf47]" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif font-bold text-3xl text-[#181d12] dark:text-[#f7fce9]">
          Settings
        </h1>
        <p className="text-sm text-[#767870] dark:text-[#464841] mt-1">
          Update your public profile and account information.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile */}
        <div className="bg-white dark:bg-[#1c2217] rounded-[1.5rem] border border-[#e0e5d2] dark:border-[#2d3226] p-6">
          <h2 className="font-semibold text-[#181d12] dark:text-[#f7fce9] mb-5 flex items-center gap-2">
            <User className="w-4 h-4 text-[#5b6300] dark:text-[#c2cf47]" />
            Profile
          </h2>

          {/* Avatar preview */}
          <div className="flex items-center gap-4 mb-5">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-16 h-16 rounded-full object-cover border-2 border-[#e0e5d2] dark:border-[#2d3226]" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#ebf0dd] dark:bg-[#2d3226] flex items-center justify-center border-2 border-[#e0e5d2] dark:border-[#2d3226]">
                <User className="w-7 h-7 text-[#5b6300] dark:text-[#c2cf47]" />
              </div>
            )}
            <div className="flex-1">
              <Field label="Avatar URL">
                <input
                  value={profile.avatar}
                  onChange={(e) => update('avatar', e.target.value)}
                  className={inputClass}
                  placeholder="https://example.com/avatar.jpg"
                />
              </Field>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full name *">
                <input
                  required
                  value={profile.name}
                  onChange={(e) => update('name', e.target.value)}
                  className={inputClass}
                  placeholder="Jane Smith"
                />
              </Field>
              <Field label="Username *">
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm text-[#767870]">@</span>
                  <input
                    required
                    value={profile.username}
                    onChange={(e) => update('username', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    className={cn(inputClass, 'pl-9')}
                    placeholder="janesmith"
                  />
                </div>
              </Field>
            </div>

            <Field label="Email">
              <input
                value={profile.email}
                disabled
                className={cn(inputClass, 'opacity-60 cursor-not-allowed')}
                placeholder="Email cannot be changed"
              />
            </Field>

            <Field label="Bio">
              <textarea
                value={profile.bio}
                onChange={(e) => update('bio', e.target.value)}
                rows={3}
                className={cn(inputClass, 'resize-none rounded-[0.75rem]')}
                placeholder="Tell readers a little about yourself…"
              />
            </Field>
          </div>
        </div>

        {/* Social links */}
        <div className="bg-white dark:bg-[#1c2217] rounded-[1.5rem] border border-[#e0e5d2] dark:border-[#2d3226] p-6">
          <h2 className="font-semibold text-[#181d12] dark:text-[#f7fce9] mb-5">Social Links</h2>
          <div className="space-y-4">
            <Field label="Twitter / X">
              <input
                value={profile.socialLinks.twitter}
                onChange={(e) => updateSocial('twitter', e.target.value)}
                className={inputClass}
                placeholder="https://twitter.com/yourhandle"
              />
            </Field>
            <Field label="GitHub">
              <input
                value={profile.socialLinks.github}
                onChange={(e) => updateSocial('github', e.target.value)}
                className={inputClass}
                placeholder="https://github.com/yourhandle"
              />
            </Field>
            <Field label="LinkedIn">
              <input
                value={profile.socialLinks.linkedin}
                onChange={(e) => updateSocial('linkedin', e.target.value)}
                className={inputClass}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </Field>
            <Field label="Website">
              <input
                value={profile.socialLinks.website}
                onChange={(e) => updateSocial('website', e.target.value)}
                className={inputClass}
                placeholder="https://yoursite.com"
              />
            </Field>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-[1rem] border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex justify-end pb-10">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#5b6300] text-white text-sm font-semibold hover:bg-[#4a5100] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : success ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {success ? 'Saved!' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#767870] dark:text-[#464841] uppercase tracking-widest mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full rounded-full border border-[#e0e5d2] dark:border-[#2d3226] bg-[#f7fce9] dark:bg-[#2d3226] text-[#181d12] dark:text-[#f7fce9] px-5 py-2.5 text-sm outline-none focus:border-[#5b6300] dark:focus:border-[#c2cf47] transition-colors placeholder:text-[#767870] dark:placeholder:text-[#464841]'
