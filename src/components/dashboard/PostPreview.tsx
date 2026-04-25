'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertCircle, Eye } from 'lucide-react'
import ArticleHeader from '@/components/ArticleHeader'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export interface PostPreviewProps {
  title: string
  subtitle?: string
  excerpt?: string
  category: 'stories' | 'tech' | 'insights'
  tags?: string[]
  coverImage?: string
  contentRaw: string
  authorName?: string
  authorAvatar?: string
  authorUsername?: string
}

const CATEGORY_LABEL: Record<PostPreviewProps['category'], string> = {
  stories:  'Stories',
  tech:     'Tech',
  insights: 'Insights',
}

/**
 * Renders an article-shaped preview from unsaved form state.
 * Calls /api/markdown/preview to render Markdown via the same server pipeline
 * used at publish time, so what the user sees here is what readers will see.
 */
export default function PostPreview(props: PostPreviewProps) {
  const [contentHtml, setContentHtml] = useState('')
  const [readingTime, setReadingTime] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Re-render when contentRaw changes (debounced).
  useEffect(() => {
    let cancelled = false
    const md = props.contentRaw

    if (!md.trim()) {
      setContentHtml('')
      setReadingTime(0)
      setError('')
      return
    }

    setLoading(true)
    setError('')
    const handle = setTimeout(async () => {
      try {
        const res = await fetch('/api/markdown/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markdown: md }),
        })
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        if (!res.ok) {
          setError(data?.error ?? 'Failed to render preview.')
          setContentHtml('')
        } else {
          setContentHtml(data.contentHtml ?? '')
          setReadingTime(data.readingTime ?? 0)
        }
      } catch {
        if (!cancelled) setError('Failed to render preview.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 250)

    return () => { cancelled = true; clearTimeout(handle) }
  }, [props.contentRaw])

  const title    = props.title.trim() || 'Untitled draft'
  const category = CATEGORY_LABEL[props.category] ?? 'Tech'
  const initials = (props.authorName || 'You')
    .split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')

  return (
    <div className="bg-[#f7fce9] dark:bg-[#181d12] -mx-6 -my-6 px-4 md:px-8 py-8 md:py-10 rounded-[1.25rem]">
      {/* Preview banner */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center gap-2 text-xs font-medium text-[#5b6300] dark:text-[#c2cf47] bg-[#d3e056]/30 dark:bg-[#d3e056]/10 px-3 py-2 rounded-full w-fit">
        <Eye className="w-3.5 h-3.5" />
        Preview — not yet published
      </div>

      <article className="max-w-4xl mx-auto">
        <ArticleHeader
          title={title}
          subtitle={props.subtitle}
          category={category}
          categorySlug={props.category}
          authorName={props.authorName ?? 'You'}
          authorInitials={initials || 'YO'}
          authorAvatar={props.authorAvatar}
          authorUsername={props.authorUsername}
          publishedAt={new Date().toISOString()}
          readingTime={readingTime || 1}
        />

        {/* Cover image */}
        {props.coverImage && (
          <div className="mb-8 md:mb-10">
            {/* Use plain <img> to avoid next/image domain config for arbitrary URLs in preview. */}
            <img
              src={props.coverImage}
              alt={title}
              className="w-full aspect-[21/9] object-cover rounded-[2rem] bg-[#ebf0dd] dark:bg-[#2d3226]"
            />
          </div>
        )}

        {/* Body */}
        <div className="bg-white dark:bg-[#1c2217] rounded-[2rem] border border-[#e0e5d2] dark:border-[#2d3226] px-6 md:px-10 py-8 md:py-10 shadow-card min-h-[200px]">
          {loading && !contentHtml ? (
            <div className="flex items-center justify-center py-16 text-sm text-[#767870] dark:text-[#464841]">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Rendering preview…
            </div>
          ) : error ? (
            <div className="flex items-start gap-2 py-8 px-4 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : !contentHtml ? (
            <p className="font-serif italic text-center py-12 text-[#767870] dark:text-[#464841]">
              Add some Markdown content to see the rendered preview here.
            </p>
          ) : (
            <MarkdownRenderer contentHtml={contentHtml} />
          )}
        </div>

        {/* Tags */}
        {props.tags && props.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {props.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#ebf0dd] dark:bg-[#2d3226] text-[#5b6300] dark:text-[#c2cf47] border border-[#d3e056]/40"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Excerpt preview (so the user sees what cards/SEO will show) */}
        {props.excerpt && (
          <div className="mt-8 p-5 rounded-[1rem] bg-white/60 dark:bg-[#1c2217]/60 border border-dashed border-[#d3dcc0] dark:border-[#2d3226]">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#767870] dark:text-[#464841] mb-2">
              Excerpt — used in cards and SEO
            </p>
            <p className="text-sm text-[#464841] dark:text-[#c6c7be] leading-relaxed">{props.excerpt}</p>
          </div>
        )}
      </article>
    </div>
  )
}
