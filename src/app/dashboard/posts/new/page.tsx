'use client'

import { useState, useRef, DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, X, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { parseMarkdownPost } from '@/lib/markdown/parseMarkdownPost'

export default function DashboardNewPostPage() {
  const router = useRouter()
  const fileInputRef  = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // ── upload state ──────────────────────────────────────────────────────────
  const [mdFile,      setMdFile]      = useState<File | null>(null)
  const [parseState,  setParseState]  = useState<'idle' | 'parsing' | 'ok' | 'error'>('idle')
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [isDragging,  setIsDragging]  = useState(false)

  // ── raw content ───────────────────────────────────────────────────────────
  const [contentRaw, setContentRaw] = useState('')

  // ── form fields ───────────────────────────────────────────────────────────
  const [title,          setTitle]          = useState('')
  const [subtitle,       setSubtitle]       = useState('')
  const [excerpt,        setExcerpt]        = useState('')
  const [slug,           setSlug]           = useState('')
  const [category,       setCategory]       = useState<'stories' | 'tech' | 'insights'>('stories')
  const [tags,           setTags]           = useState('')
  const [featured,       setFeatured]       = useState(false)
  const [coverImageUrl,  setCoverImageUrl]  = useState('')
  const [seoTitle,       setSeoTitle]       = useState('')
  const [seoDescription, setSeoDescription] = useState('')

  // ── image upload state ────────────────────────────────────────────────────
  const [imageUploading, setImageUploading] = useState(false)

  // ── save state ────────────────────────────────────────────────────────────
  const [saving,    setSaving]    = useState(false)
  const [saveError, setSaveError] = useState('')

  // ── parse helpers ─────────────────────────────────────────────────────────

  function applyParsedDraft(file: File) {
    setMdFile(file)
    setParseState('parsing')
    setParseErrors([])

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result
      if (typeof text !== 'string') {
        setParseState('error')
        setParseErrors(['Could not read file contents.'])
        return
      }

      const draft = parseMarkdownPost(text)

      setContentRaw(draft.contentRaw)
      setTitle(draft.title)
      setSubtitle(draft.subtitle)
      setExcerpt(draft.excerpt)
      setSlug(draft.slug)
      setCategory(draft.category)
      setTags(draft.tags.join(', '))
      setFeatured(draft.featured)
      if (draft.coverImage) setCoverImageUrl(draft.coverImage)
      setSeoTitle(draft.seoTitle)
      setSeoDescription(draft.seoDescription)

      if (draft.validationErrors.length > 0) {
        setParseState('error')
        setParseErrors(draft.validationErrors)
      } else {
        setParseState('ok')
      }
    }
    reader.onerror = () => {
      setParseState('error')
      setParseErrors(['Failed to read the file.'])
    }
    reader.readAsText(file, 'utf-8')
  }

  function handleFileInput(file: File) {
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      setParseState('error')
      setParseErrors(['Please upload a .md or .markdown file.'])
      return
    }

    if ((title.trim() || contentRaw.trim()) && mdFile) {
      if (!confirm('Replace current content with the new file?')) return
    }

    applyParsedDraft(file)
  }

  // ── drag-and-drop ─────────────────────────────────────────────────────────

  function onDragOver(e: DragEvent<HTMLDivElement>) { e.preventDefault(); setIsDragging(true) }
  function onDragLeave(e: DragEvent<HTMLDivElement>) { e.preventDefault(); setIsDragging(false) }
  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileInput(file)
  }

  // ── image upload ──────────────────────────────────────────────────────────

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

  // ── save ──────────────────────────────────────────────────────────────────

  async function handleSave(publishNow: boolean) {
    setSaveError('')
    setSaving(true)

    try {
      const body = {
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
        contentRaw,
        status:      publishNow ? 'published' : 'draft',
        publishedAt: publishNow ? new Date().toISOString() : undefined,
      }

      const res = await fetch('/api/user/posts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/dashboard/posts/${data.post._id}/edit`)
      } else {
        const data = await res.json()
        setSaveError(data.error ?? 'Failed to save post.')
      }
    } catch {
      setSaveError('Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const canSave = title.trim() && slug.trim()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif font-bold text-3xl text-[#181d12] dark:text-[#f7fce9]">
          New Post
        </h1>
        <p className="text-sm text-[#767870] dark:text-[#464841] mt-1">
          Upload a markdown file to auto-fill the form, or fill it in manually.
        </p>
      </div>

      {/* Markdown upload */}
      <div className="bg-white dark:bg-[#1c2217] rounded-[1.5rem] border border-[#e0e5d2] dark:border-[#2d3226] p-6 mb-6">
        <h2 className="font-semibold text-[#181d12] dark:text-[#f7fce9] mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#5b6300] dark:text-[#c2cf47]" />
          Markdown File
        </h2>

        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileInput(e.target.files[0])}
        />

        {parseState === 'idle' || !mdFile ? (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'w-full border-2 border-dashed rounded-[1rem] py-12 flex flex-col items-center gap-3 cursor-pointer transition-colors select-none',
              isDragging
                ? 'border-[#5b6300] dark:border-[#c2cf47] bg-[#f1f6e3] dark:bg-[#2d3226]/30 text-[#5b6300] dark:text-[#c2cf47]'
                : 'border-[#d3dcc0] dark:border-[#2d3226] text-[#767870] dark:text-[#464841] hover:border-[#5b6300] dark:hover:border-[#c2cf47] hover:text-[#5b6300] dark:hover:text-[#c2cf47]'
            )}
          >
            <Upload className="w-8 h-8" />
            <span className="text-sm font-medium">
              {isDragging ? 'Drop to upload' : 'Click or drag a .md file here'}
            </span>
            <span className="text-xs">Frontmatter will be auto-extracted and fields filled in</span>
          </div>
        ) : (
          <div className={cn(
            'flex items-start gap-3 p-4 rounded-[0.75rem]',
            parseState === 'error' ? 'bg-red-50 dark:bg-red-950/30' : 'bg-[#f7fce9] dark:bg-[#2d3226]/40'
          )}>
            {parseState === 'parsing' ? (
              <Loader2 className="w-5 h-5 mt-0.5 animate-spin text-[#5b6300] dark:text-[#c2cf47] shrink-0" />
            ) : parseState === 'error' ? (
              <AlertCircle className="w-5 h-5 mt-0.5 text-red-500 shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 mt-0.5 text-emerald-500 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#181d12] dark:text-[#f7fce9] truncate">{mdFile.name}</p>
              {parseState === 'parsing' && <p className="text-xs text-[#767870] dark:text-[#464841] mt-0.5">Parsing…</p>}
              {parseState === 'ok' && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Parsed · fields auto-filled</p>}
              {parseState === 'error' && parseErrors.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {parseErrors.map((err, i) => (
                    <li key={i} className="text-xs text-red-600 dark:text-red-400">{err}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => fileInputRef.current?.click()} className="text-xs text-[#5b6300] dark:text-[#c2cf47] hover:underline">
                Replace
              </button>
              <button
                onClick={() => { setMdFile(null); setParseState('idle'); setParseErrors([]) }}
                className="text-[#767870] hover:text-[#181d12] dark:hover:text-[#f7fce9] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Post Details */}
      <div className="bg-white dark:bg-[#1c2217] rounded-[1.5rem] border border-[#e0e5d2] dark:border-[#2d3226] p-6 mb-6">
        <h2 className="font-semibold text-[#181d12] dark:text-[#f7fce9] mb-5">Post Details</h2>
        <div className="space-y-4">
          <Field label="Title *">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Post title" />
          </Field>
          <Field label="Subtitle">
            <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputClass} placeholder="Optional subtitle" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Slug *">
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} placeholder="url-friendly-slug" />
            </Field>
            <Field label="Category *">
              <select value={category} onChange={(e) => setCategory(e.target.value as 'stories' | 'tech' | 'insights')} className={inputClass}>
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
              placeholder="Short description for cards and SEO"
            />
          </Field>
          <Field label="Tags (comma-separated)">
            <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} placeholder="tag1, tag2, tag3" />
          </Field>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 rounded accent-[#5b6300]" />
            <span className="text-sm text-[#464841] dark:text-[#c6c7be]">Feature this post on the homepage</span>
          </label>
        </div>
      </div>

      {/* Cover Image */}
      <div className="bg-white dark:bg-[#1c2217] rounded-[1.5rem] border border-[#e0e5d2] dark:border-[#2d3226] p-6 mb-6">
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
            <img src={coverImageUrl} alt="Cover preview" className="w-16 h-16 object-cover rounded-[0.5rem] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#181d12] dark:text-[#f7fce9] truncate font-mono">{coverImageUrl}</p>
            </div>
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
              Upload image
            </button>
            <div className="flex-1">
              <input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} className={inputClass} placeholder="Or paste an image URL" />
            </div>
          </div>
        )}
      </div>

      {/* SEO */}
      <div className="bg-white dark:bg-[#1c2217] rounded-[1.5rem] border border-[#e0e5d2] dark:border-[#2d3226] p-6 mb-6">
        <h2 className="font-semibold text-[#181d12] dark:text-[#f7fce9] mb-5">SEO (optional)</h2>
        <div className="space-y-4">
          <Field label="SEO Title">
            <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={inputClass} placeholder="Defaults to post title" />
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
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 rounded-[1rem] border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
        </div>
      )}

      <div className="flex items-center gap-3 justify-end pb-10">
        <button
          onClick={() => handleSave(false)}
          disabled={saving || !canSave}
          className="px-6 py-2.5 rounded-full border border-[#e0e5d2] dark:border-[#2d3226] text-sm font-semibold text-[#464841] dark:text-[#c6c7be] hover:bg-[#f1f6e3] dark:hover:bg-[#2d3226]/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save as draft
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving || !canSave}
          className="px-6 py-2.5 rounded-full bg-[#5b6300] text-white text-sm font-semibold hover:bg-[#4a5100] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Publish now
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
