'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, ImageIcon, Loader2, Eye, EyeOff, Trash2, X, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DbPost } from '@/types'

interface EditUserPostFormProps {
  post: DbPost
}

export default function EditUserPostForm({ post }: EditUserPostFormProps) {
  const router       = useRouter()
  const imageInputRef   = useRef<HTMLInputElement>(null)
  const mdFileInputRef  = useRef<HTMLInputElement>(null)

  const [title,          setTitle]          = useState(post.title)
  const [subtitle,       setSubtitle]       = useState(post.subtitle ?? '')
  const [excerpt,        setExcerpt]        = useState(post.excerpt ?? '')
  const [slug,           setSlug]           = useState(post.slug)
  const [category,       setCategory]       = useState(post.category)
  const [tags,           setTags]           = useState(post.tags.join(', '))
  const [featured,       setFeatured]       = useState(post.featured)
  const [coverImageUrl,  setCoverImageUrl]  = useState(post.coverImage ?? '')
  const [seoTitle,       setSeoTitle]       = useState(post.seoTitle ?? '')
  const [seoDescription, setSeoDescription] = useState(post.seoDescription ?? '')

  const [imageUploading,  setImageUploading]  = useState(false)
  const [mdReplaceLoading, setMdReplaceLoading] = useState(false)
  const [mdReplaceNote,   setMdReplaceNote]   = useState('')

  const [saving,       setSaving]       = useState(false)
  const [saveError,    setSaveError]    = useState('')
  const [saveSuccess,  setSaveSuccess]  = useState(false)
  const [publishLoading, setPublishLoading] = useState(false)
  const [deleteLoading,  setDeleteLoading]  = useState(false)
  const [currentStatus,  setCurrentStatus]  = useState(post.status)

  async function handleImageUpload(file: File) {
    setImageUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res  = await fetch('/api/upload/image', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) setCoverImageUrl(data.url)
    } finally {
      setImageUploading(false)
    }
  }

  async function handleMdReplace(file: File) {
    setMdReplaceLoading(true)
    setMdReplaceNote('')
    try {
      const text = await file.text()
      const res  = await fetch(`/api/user/posts/${post._id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ contentRaw: text }),
      })
      if (res.ok) {
        setMdReplaceNote('Content updated from new file.')
        router.refresh()
      } else {
        const data = await res.json()
        setMdReplaceNote(data.error ?? 'Failed to update content.')
      }
    } finally {
      setMdReplaceLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    setSaveSuccess(false)

    try {
      const res = await fetch(`/api/user/posts/${post._id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          title,
          subtitle:       subtitle       || undefined,
          excerpt:        excerpt        || undefined,
          slug,
          category,
          postType:       category === 'stories' ? 'story' : category === 'tech' ? 'tech' : 'insight',
          tags:           tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          featured,
          coverImage:     coverImageUrl  || undefined,
          seoTitle:       seoTitle       || undefined,
          seoDescription: seoDescription || undefined,
        }),
      })

      if (res.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        router.refresh()
      } else {
        const data = await res.json()
        setSaveError(data.error ?? 'Failed to save.')
      }
    } catch {
      setSaveError('Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePublishToggle() {
    setPublishLoading(true)
    try {
      await fetch(`/api/user/posts/${post._id}/publish`, { method: 'POST' })
      setCurrentStatus((s) => (s === 'published' ? 'draft' : 'published'))
      router.refresh()
    } finally {
      setPublishLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this post permanently? This cannot be undone.')) return
    setDeleteLoading(true)
    try {
      await fetch(`/api/user/posts/${post._id}`, { method: 'DELETE' })
      router.push('/dashboard/posts')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#1c2217] rounded-[1.5rem] border border-[#e0e5d2] dark:border-[#2d3226] px-6 py-4">
        <div className="flex items-center gap-3">
          <span className={cn(
            'text-xs font-medium px-2.5 py-1 rounded-full',
            currentStatus === 'published'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
          )}>
            {currentStatus}
          </span>
          {currentStatus === 'published' && (
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs text-[#5b6300] dark:text-[#c2cf47] hover:underline"
            >
              View live <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePublishToggle}
            disabled={publishLoading || deleteLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#e0e5d2] dark:border-[#2d3226] text-sm font-medium text-[#464841] dark:text-[#c6c7be] hover:bg-[#f1f6e3] dark:hover:bg-[#2d3226]/50 transition-colors disabled:opacity-50"
          >
            {publishLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : currentStatus === 'published' ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {currentStatus === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          <button
            onClick={handleDelete}
            disabled={publishLoading || deleteLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 dark:border-red-900 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
          >
            {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>

      {/* Post Details */}
      <div className="bg-white dark:bg-[#1c2217] rounded-[1.5rem] border border-[#e0e5d2] dark:border-[#2d3226] p-6">
        <h2 className="font-semibold text-[#181d12] dark:text-[#f7fce9] mb-5">Post Details</h2>
        <div className="space-y-4">
          <Field label="Title *">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Subtitle">
            <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputClass} placeholder="Optional" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Slug *">
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Category *">
              <select value={category} onChange={(e) => setCategory(e.target.value as DbPost['category'])} className={inputClass}>
                <option value="stories">Stories</option>
                <option value="tech">Tech</option>
                <option value="insights">Insights</option>
              </select>
            </Field>
          </div>
          <Field label="Excerpt">
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className={cn(inputClass, 'resize-none rounded-[0.75rem]')}
              placeholder="Short description"
            />
          </Field>
          <Field label="Tags (comma-separated)">
            <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} placeholder="tag1, tag2" />
          </Field>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 rounded accent-[#5b6300]" />
            <span className="text-sm text-[#464841] dark:text-[#c6c7be]">Feature on homepage</span>
          </label>
        </div>
      </div>

      {/* Cover image */}
      <div className="bg-white dark:bg-[#1c2217] rounded-[1.5rem] border border-[#e0e5d2] dark:border-[#2d3226] p-6">
        <h2 className="font-semibold text-[#181d12] dark:text-[#f7fce9] mb-5 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#5b6300] dark:text-[#c2cf47]" />
          Cover Image
        </h2>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
        />
        {coverImageUrl ? (
          <div className="flex items-center gap-3 p-3 bg-[#f7fce9] dark:bg-[#2d3226]/40 rounded-[0.75rem]">
            <img src={coverImageUrl} alt="Cover" className="w-16 h-16 object-cover rounded-[0.5rem] shrink-0" />
            <p className="flex-1 min-w-0 text-xs text-[#181d12] dark:text-[#f7fce9] font-mono truncate">{coverImageUrl}</p>
            <button onClick={() => setCoverImageUrl('')} className="text-[#767870] hover:text-red-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => imageInputRef.current?.click()}
              disabled={imageUploading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#e0e5d2] dark:border-[#2d3226] text-sm text-[#464841] dark:text-[#c6c7be] hover:bg-[#f1f6e3] dark:hover:bg-[#2d3226]/50 transition-colors disabled:opacity-50 shrink-0"
            >
              {imageUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload
            </button>
            <input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} className={inputClass} placeholder="Or paste image URL" />
          </div>
        )}
      </div>

      {/* Replace markdown content */}
      <div className="bg-white dark:bg-[#1c2217] rounded-[1.5rem] border border-[#e0e5d2] dark:border-[#2d3226] p-6">
        <h2 className="font-semibold text-[#181d12] dark:text-[#f7fce9] mb-2">Replace Content</h2>
        <p className="text-xs text-[#767870] dark:text-[#464841] mb-4">
          Upload a new .md file to replace the post body. Metadata above is preserved.
        </p>
        <input
          ref={mdFileInputRef}
          type="file"
          accept=".md,.markdown"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleMdReplace(e.target.files[0])}
        />
        <button
          onClick={() => mdFileInputRef.current?.click()}
          disabled={mdReplaceLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#e0e5d2] dark:border-[#2d3226] text-sm text-[#464841] dark:text-[#c6c7be] hover:bg-[#f1f6e3] dark:hover:bg-[#2d3226]/50 transition-colors disabled:opacity-50"
        >
          {mdReplaceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload new .md file
        </button>
        {mdReplaceNote && (
          <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">{mdReplaceNote}</p>
        )}
      </div>

      {/* SEO */}
      <div className="bg-white dark:bg-[#1c2217] rounded-[1.5rem] border border-[#e0e5d2] dark:border-[#2d3226] p-6">
        <h2 className="font-semibold text-[#181d12] dark:text-[#f7fce9] mb-5">SEO</h2>
        <div className="space-y-4">
          <Field label="SEO Title">
            <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={inputClass} placeholder="Defaults to title" />
          </Field>
          <Field label="SEO Description">
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
              className={cn(inputClass, 'resize-none rounded-[0.75rem]')}
              placeholder="Defaults to excerpt"
            />
          </Field>
        </div>
      </div>

      {saveError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-[1rem] border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
        </div>
      )}

      <div className="flex justify-end pb-10">
        <button
          onClick={handleSave}
          disabled={saving || !title || !slug}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#5b6300] text-white text-sm font-semibold hover:bg-[#4a5100] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saveSuccess ? 'Saved!' : 'Save changes'}
        </button>
      </div>
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
