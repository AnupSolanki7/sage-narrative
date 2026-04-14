'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock } from 'lucide-react'
import { cn, formatDate, getCategorySlug } from '@/lib/utils'
import type { MockPost } from '@/types'

interface PostCardProps {
  post: MockPost
  featured?: boolean
  className?: string
}

const categoryColors: Record<string, string> = {
  Stories: 'bg-[#d3e056] text-[#5a6200]',
  Story: 'bg-[#d3e056] text-[#5a6200]',
  Tech: 'bg-[#c2d9f0] text-[#1a3a5c]',
  Insights: 'bg-[#f0d9c2] text-[#5c3a1a]',
  Insight: 'bg-[#f0d9c2] text-[#5c3a1a]',
}

const gradients = [
  'from-[#ebf0dd] to-[#d3e056]',
  'from-[#dde8f0] to-[#b8d4e8]',
  'from-[#f0e8dd] to-[#e8c9a0]',
  'from-[#eeddee] to-[#d4b8d4]',
  'from-[#ddf0ed] to-[#b8e4de]',
  'from-[#f0f0dd] to-[#e4e0b8]',
]

export default function PostCard({ post, featured = false, className }: PostCardProps) {
  const gradientIndex = post.id.charCodeAt(0) % gradients.length
  const gradient = post.coverGradient ?? gradients[gradientIndex]
  const categoryColor = categoryColors[post.category] ?? 'bg-[#d3e056] text-[#5a6200]'
  const categorySlug = post.categorySlug ?? getCategorySlug(post.category)

  return (
    <article className={cn('group', className)}>
      <Link href={`/blog/${post.slug}`} className="block">
        <div
          className={cn(
            'relative aspect-[16/10] rounded-[1rem] overflow-hidden mb-4',
            !post.coverImageUrl && `bg-gradient-to-br ${gradient}`
          )}
        >
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <>
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-white/20" />
                <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-white/15" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/10" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-serif italic text-2xl font-semibold text-white/60 text-center px-6 leading-snug">
                  {post.title.split(' ').slice(0, 4).join(' ')}
                </span>
              </div>
            </>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>
      </Link>

      <div className="flex items-center gap-3 mb-2.5">
        <Link
          href={`/${categorySlug}`}
          className={cn(
            'text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full',
            categoryColor
          )}
        >
          {post.category}
        </Link>

        <span className="flex items-center gap-1 text-xs text-[#767870] dark:text-[#464841]">
          <Clock className="w-3 h-3" />
          {post.readingTime} min read
        </span>
      </div>

      <Link href={`/blog/${post.slug}`} className="block">
        <h3
          className={cn(
            'font-serif font-bold leading-snug text-[#181d12] dark:text-[#f7fce9] mb-2',
            'group-hover:text-[#5b6300] dark:group-hover:text-[#c2cf47] transition-colors',
            featured ? 'text-2xl md:text-3xl' : 'text-xl'
          )}
        >
          {post.title}
        </h3>

        <p className="text-sm text-[#464841] dark:text-[#c6c7be] leading-relaxed line-clamp-2 mb-3">
          {post.excerpt}
        </p>
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {post.author.avatar ? (
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#5b6300] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {post.author.initials}
            </div>
          )}

          {post.author.username ? (
            <Link
              href={`/author/${post.author.username}`}
              className="text-xs text-[#464841] dark:text-[#c6c7be] font-medium hover:text-[#5b6300] dark:hover:text-[#c2cf47] transition-colors"
            >
              {post.author.name}
            </Link>
          ) : (
            <span className="text-xs text-[#464841] dark:text-[#c6c7be] font-medium">
              {post.author.name}
            </span>
          )}
        </div>

        <span className="text-xs text-[#767870] dark:text-[#464841]">
          {formatDate(post.publishedAt)}
        </span>
      </div>
    </article>
  )
}