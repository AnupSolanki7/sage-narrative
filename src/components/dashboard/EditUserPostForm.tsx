'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, ImageIcon, Loader2, Eye, EyeOff, Trash2, X, ExternalLink, ClipboardPaste, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DbPost } from '@/types'
import MarkdownImageUploadButton from '@/components/dashboard/MarkdownImageUploadButton'
import PostPreview from '@/components/dashboard/PostPreview'
import PublishChecklist, { checklistStatus } from '@/components/dashboard/PublishChecklist'
import AIWritingAssistant from '@/components/dashboard/AIWritingAssistant'
import { parseMarkdownContent } from '@/lib/markdown/parseMarkdownPost'

type ReplaceMode = 'upload' | 'paste'

interface EditUserPostFormProps {
  post: DbPost
}

export default function EditUserPostForm({ post }: EditUserPostFormProps) {
  const router       = useRouter()
  const imageInputRef     = useRef<HTMLInputElement>(null)
  const mdFileInputRef    = useRef<HTMLInputElement>(null)
  const pasteTextareaRef  = useRef<HTMLTextAreaElement>(null)

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
  const [contentRaw,     setContentRaw]     = useState(post.contentRaw)

  const [imageUploading,  setImageUploading]  = useState(false)
  const [mdReplaceLoading, setMdReplaceLoading] = useState(false)
  const [mdReplaceNote,   setMdReplaceNote]   = useState('')
  const [replaceMode,     setReplaceMode]     = useState<ReplaceMode>('upload')
  const [pastedMarkdown,  setPastedMarkdown]  = useState('')

  const [saving,       setSaving]       = useState(false)
  const [saveError,    setSaveError]    = useState('')
  const [saveSuccess,  setSaveSuccess]  = useState(false)
  const [publishLoading, setPublishLoading] = useState(false)
  const [deleteLoading,  setDeleteLoading]  = useState(false)
  const [currentStatus,  setCurrentStatus]  = useState(post.status)

  const [viewMode,    setViewMode]    = useState<'editor' | 'preview'>('editor')
  const [previewSeen, setPreviewSeen] = useState(false)

  // Author info from the populated post — used in the preview header.
  const populatedAuthor = post.authorId && typeof post.authorId === 'object' ? post.authorId : null
  const authorName     = populatedAuthor?.name ?? post.author ?? 'You'
  const authorAvatar   = populatedAuthor?.avatar
  const authorUsername = populatedAuthor?.username

  // Preview always reflects the live contentRaw the user is editing.
  // Pastes into the Replace pane override the live state for in-flight previews.
  const previewContentRaw = pastedMarkdown.trim() ? pastedMarkdown : contentRaw

  /**
   * Apply an AI-generated Markdown draft to the editor.
   * Routes through the same parser the upload/paste paths use, so all three
   * code paths converge into one applyDraft.
   */
  function applyAIDraft(markdown: string) {
    const draft = parseMarkdownContent(markdown)
    setContentRaw(draft.contentRaw)
    setTitle(draft.title)
    setSubtitle(draft.subtitle)
    setExcerpt(draft.excerpt)
    if (draft.slug) setSlug(draft.slug)
    setCategory(draft.category)
    setTags(draft.tags.join(', '))
    if (draft.coverImage) setCoverImageUrl(draft.coverImage)
    setSeoTitle(draft.seoTitle)
    setSeoDescription(draft.seoDescription)
  }

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

  async function sendReplace(text: string, successMsg: string) {
    setMdReplaceLoading(true)
    setMdReplaceNote('')
    try {
      const res = await fetch(`/api/user/posts/${post._id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ contentRaw: text }),
      })
      if (res.ok) {
        setMdReplaceNote(successMsg)
        // Mirror the saved content into local state so the editor + preview
        // reflect what's now in the database.
        setContentRaw(text)
        router.refresh()
      } else {
        const data = await res.json()
        setMdReplaceNote(data.error ?? 'Failed to update content.')
      }
    } finally {
      setMdReplaceLoading(false)
    }
  }

  async function handleMdReplace(file: File) {
    const text = await file.text()
    await sendReplace(text, 'Content updated from new file.')
  }

  async function handlePasteReplace() {
    if (!pastedMarkdown.trim()) {
      setMdReplaceNote('Paste some Markdown content first.')
      return
    }
    await sendReplace(pastedMarkdown, 'Content updated from pasted Markdown.')
    setPastedMarkdown('')
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
          // Always send the live contentRaw — the API regenerates contentHtml
          // and readingTime from this. Without this field, body edits weren't
          // being persisted (only the Replace Content tab worked).
          contentRaw,
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

      {/* Editor / Preview tabs */}
      <div>
        <div className="inline-flex p-1 rounded-full bg-white dark:bg-[#1c2217] border border-[#e0e5d2] dark:border-[#2d3226] shadow-card">
          <button
            type="button"
            onClick={() => setViewMode('editor')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors',
              viewMode === 'editor'
                ? 'bg-[#5b6300] text-white'
                : 'text-[#767870] dark:text-[#464841] hover:text-[#181d12] dark:hover:text-[#f7fce9]'
            )}
          >
            <Pencil className="w-3.5 h-3.5" />
            Editor
          </button>
          <button
            type="button"
            onClick={() => { setPreviewSeen(true); setViewMode('preview') }}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors',
              viewMode === 'preview'
                ? 'bg-[#5b6300] text-white'
                : 'text-[#767870] dark:text-[#464841] hover:text-[#181d12] dark:hover:text-[#f7fce9]'
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
        </div>
      </div>

      {viewMode === 'preview' && (
        <>
          <PostPreview
            title={title}
            subtitle={subtitle}
            excerpt={excerpt}
            category={category}
            tags={tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : []}
            coverImage={coverImageUrl || undefined}
            contentRaw={previewContentRaw}
            authorName={authorName}
            authorAvatar={authorAvatar}
            authorUsername={authorUsername}
          />
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => setViewMode('editor')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#e0e5d2] dark:border-[#2d3226] text-sm font-semibold text-[#464841] dark:text-[#c6c7be] hover:bg-[#f1f6e3] dark:hover:bg-[#2d3226]/50 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Back to editor
            </button>
          </div>
        </>
      )}

      {viewMode === 'editor' && <>

      {/* AI Writing Assistant */}
      <AIWritingAssistant
        categoryHint={category}
        authorHint={authorName}
        hasExistingContent={Boolean(title.trim() || contentRaw.trim())}
        onApply={applyAIDraft}
      />

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

      {/* Blog Content — direct editing of contentRaw */}
      <div className="bg-white dark:bg-[#1c2217] rounded-[1.5rem] border border-[#e0e5d2] dark:border-[#2d3226] p-6">
        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
          <h2 className="font-semibold text-[#181d12] dark:text-[#f7fce9]">Blog Content</h2>
          {contentRaw.trim() && (
            <span className="text-xs text-[#767870] dark:text-[#464841]">
              {contentRaw.trim().split(/\s+/).filter(Boolean).length.toLocaleString()} words
            </span>
          )}
        </div>
        <p className="text-xs text-[#767870] dark:text-[#464841] mb-3">
          Write or edit your Markdown content here. You can include headings, images, tables, and code blocks.
        </p>
        <textarea
          value={contentRaw}
          onChange={(e) => setContentRaw(e.target.value)}
          rows={18}
          spellCheck={false}
          className="w-full rounded-[0.75rem] border border-[#e0e5d2] dark:border-[#2d3226] bg-[#f7fce9] dark:bg-[#2d3226] text-[#181d12] dark:text-[#f7fce9] px-4 py-3 text-sm font-mono leading-relaxed outline-none focus:border-[#5b6300] dark:focus:border-[#c2cf47] transition-colors placeholder:text-[#767870] dark:placeholder:text-[#464841] resize-y"
        />
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
        <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
          <h2 className="font-semibold text-[#181d12] dark:text-[#f7fce9]">Replace Content</h2>
          <div className="inline-flex p-1 rounded-full bg-[#f1f6e3] dark:bg-[#2d3226]/60 border border-[#e0e5d2] dark:border-[#2d3226]">
            <button
              type="button"
              onClick={() => { setReplaceMode('upload'); setMdReplaceNote('') }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                replaceMode === 'upload'
                  ? 'bg-white dark:bg-[#1c2217] text-[#5b6300] dark:text-[#c2cf47] shadow-sm'
                  : 'text-[#767870] dark:text-[#464841] hover:text-[#181d12] dark:hover:text-[#f7fce9]'
              )}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload .md
            </button>
            <button
              type="button"
              onClick={() => { setReplaceMode('paste'); setMdReplaceNote('') }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                replaceMode === 'paste'
                  ? 'bg-white dark:bg-[#1c2217] text-[#5b6300] dark:text-[#c2cf47] shadow-sm'
                  : 'text-[#767870] dark:text-[#464841] hover:text-[#181d12] dark:hover:text-[#f7fce9]'
              )}
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              Paste Markdown
            </button>
          </div>
        </div>
        <p className="text-xs text-[#767870] dark:text-[#464841] mb-4">
          {replaceMode === 'upload'
            ? 'Upload a new .md file to replace the post body. Metadata above is preserved.'
            : 'Paste Markdown below to replace the post body. Metadata above is preserved.'}
        </p>

        {replaceMode === 'upload' ? (
          <>
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
          </>
        ) : (
          <>
            <div className="flex justify-end mb-2">
              <MarkdownImageUploadButton
                textareaRef={pasteTextareaRef}
                value={pastedMarkdown}
                onChange={setPastedMarkdown}
              />
            </div>
            <textarea
              ref={pasteTextareaRef}
              value={pastedMarkdown}
              onChange={(e) => setPastedMarkdown(e.target.value)}
              rows={12}
              spellCheck={false}
              placeholder={`# Your post body…`}
              className="w-full rounded-[0.75rem] border border-[#e0e5d2] dark:border-[#2d3226] bg-[#f7fce9] dark:bg-[#2d3226] text-[#181d12] dark:text-[#f7fce9] px-4 py-3 text-sm font-mono outline-none focus:border-[#5b6300] dark:focus:border-[#c2cf47] transition-colors placeholder:text-[#767870] dark:placeholder:text-[#464841] resize-y"
            />
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={handlePasteReplace}
                disabled={mdReplaceLoading || !pastedMarkdown.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5b6300] text-white text-sm font-semibold hover:bg-[#4a5100] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mdReplaceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardPaste className="w-4 h-4" />}
                Replace content
              </button>
              {pastedMarkdown && (
                <button
                  type="button"
                  onClick={() => setPastedMarkdown('')}
                  className="text-xs text-[#767870] dark:text-[#464841] hover:text-[#181d12] dark:hover:text-[#f7fce9] transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </>
        )}

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

      {/* Pre-publish review checklist — only meaningful when the post isn't yet published. */}
      {currentStatus !== 'published' && (
        <PublishChecklist
          title={title}
          category={category}
          excerpt={excerpt}
          coverImage={coverImageUrl}
          seoDescription={seoDescription}
          contentRaw={previewContentRaw}
          previewed={previewSeen}
        />
      )}

      {saveError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-[1rem] border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pb-10 flex-wrap">
        <button
          type="button"
          onClick={() => { setPreviewSeen(true); setViewMode('preview') }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[#e0e5d2] dark:border-[#2d3226] text-sm font-semibold text-[#464841] dark:text-[#c6c7be] hover:bg-[#f1f6e3] dark:hover:bg-[#2d3226]/50 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Preview post
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !title || !slug}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#5b6300] text-white text-sm font-semibold hover:bg-[#4a5100] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saveSuccess ? 'Saved!' : 'Save changes'}
        </button>
      </div>
      </>}
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
