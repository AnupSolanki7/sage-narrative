'use client'

import { useRef, useState, RefObject } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  /** Ref to the Markdown textarea this button inserts into. */
  textareaRef: RefObject<HTMLTextAreaElement>
  /** Current textarea value. */
  value: string
  /** Called with the new markdown text after insertion. */
  onChange: (next: string) => void
  className?: string
}

/**
 * "Upload image" button placed next to a Markdown textarea.
 *
 *  - Uploads via the existing POST /api/upload/image route (auth-gated there).
 *  - On success, inserts `![alt](url)` at the caret, or appends if the
 *    textarea was never focused. Alt text defaults to the uploaded filename
 *    without the extension but is editable via a prompt.
 *  - Surfaces friendly errors from the API (type, size, auth, transport).
 */
export default function MarkdownImageUploadButton({
  textareaRef,
  value,
  onChange,
  className,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file: File) {
    setError('')

    // Client-side sanity checks (server re-validates).
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5 MB or smaller.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload/image', { method: 'POST', body: formData })
      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data?.url) {
        setError(data?.error ?? 'Upload failed. Please try again.')
        return
      }

      const defaultAlt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'image'
      const alt = window.prompt('Alt text for the image:', defaultAlt) ?? defaultAlt
      insertMarkdown(`![${alt}](${data.url})`)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  function insertMarkdown(snippet: string) {
    const el = textareaRef.current
    // Surround with blank lines so the image becomes its own paragraph.
    const wrap = (left: string, right: string) =>
      `${left}${left && !left.endsWith('\n') ? '\n\n' : ''}${snippet}${right && !right.startsWith('\n') ? '\n\n' : ''}${right}`

    if (!el) {
      // Fallback: append.
      onChange(wrap(value, ''))
      return
    }

    const start = el.selectionStart ?? value.length
    const end   = el.selectionEnd   ?? value.length
    const before = value.slice(0, start)
    const after  = value.slice(end)
    const next   = wrap(before, after)

    onChange(next)

    // Restore caret just after the inserted snippet on the next tick.
    const caret = before.length + (before && !before.endsWith('\n') ? 2 : 0) + snippet.length
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(caret, caret)
    })
  }

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          // Reset so picking the same file twice still fires onChange.
          e.target.value = ''
        }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e0e5d2] dark:border-[#2d3226] text-xs font-medium text-[#464841] dark:text-[#c6c7be] hover:bg-[#f1f6e3] dark:hover:bg-[#2d3226]/50 transition-colors disabled:opacity-50"
      >
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
        {uploading ? 'Uploading…' : 'Upload image'}
      </button>
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
      )}
    </div>
  )
}
