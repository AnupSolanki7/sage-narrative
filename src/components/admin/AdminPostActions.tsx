'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PenSquare, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'

interface AdminPostActionsProps {
  postId: string
  status: 'draft' | 'published'
  slug: string
}

export default function AdminPostActions({ postId, status, slug }: AdminPostActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<'publish' | 'delete' | null>(null)

  async function handlePublishToggle() {
    setLoading('publish')
    try {
      await fetch(`/api/posts/${postId}/publish`, { method: 'POST' })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this post? This cannot be undone.')) return
    setLoading('delete')
    try {
      await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/posts/${postId}/edit`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#5b6300] dark:text-[#c2cf47] hover:bg-[#ebf0dd] dark:hover:bg-[#2d3226] transition-colors"
      >
        <PenSquare className="w-3.5 h-3.5" />
        Edit
      </Link>

      <button
        onClick={handlePublishToggle}
        disabled={loading !== null}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#464841] dark:text-[#c6c7be] hover:bg-[#f1f6e3] dark:hover:bg-[#2d3226]/50 transition-colors disabled:opacity-50"
        title={status === 'published' ? 'Unpublish' : 'Publish'}
      >
        {loading === 'publish' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : status === 'published' ? (
          <EyeOff className="w-3.5 h-3.5" />
        ) : (
          <Eye className="w-3.5 h-3.5" />
        )}
        {status === 'published' ? 'Unpublish' : 'Publish'}
      </button>

      <button
        onClick={handleDelete}
        disabled={loading !== null}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
        title="Delete post"
      >
        {loading === 'delete' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
        Delete
      </button>
    </div>
  )
}
