import Link from 'next/link'
import { Calendar, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ArticleMetaProps {
  authorName?: string
  authorRole?: string
  authorInitials?: string
  authorAvatar?: string
  authorUsername?: string
  publishedAt: string
  updatedAt?: string
  readingTime: number
  compact?: boolean
}

export default function ArticleMeta({
  authorName,
  authorRole,
  authorInitials,
  authorAvatar,
  authorUsername,
  publishedAt,
  updatedAt,
  readingTime,
  compact = false,
}: ArticleMetaProps) {
  const name     = authorName     ?? 'Unknown Author'
  const initials = authorInitials ?? 'A'
  const avatarSize = compact ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'

  const avatar = authorAvatar ? (
    <img
      src={authorAvatar}
      alt={name}
      className={`rounded-full object-cover shrink-0 ${avatarSize}`}
    />
  ) : (
    <div className={`rounded-full bg-[#5b6300] flex items-center justify-center text-white font-bold shrink-0 ${avatarSize}`}>
      {initials}
    </div>
  )

  const nameEl = authorUsername ? (
    <Link
      href={`/author/${authorUsername}`}
      className="font-semibold text-[#181d12] dark:text-[#f7fce9] hover:text-[#5b6300] dark:hover:text-[#c2cf47] transition-colors"
    >
      {name}
    </Link>
  ) : (
    <p className="font-semibold text-[#181d12] dark:text-[#f7fce9]">{name}</p>
  )

  return (
    <div className={`flex flex-wrap items-center gap-4 ${compact ? 'text-xs' : 'text-sm'}`}>
      {/* Author */}
      <div className="flex items-center gap-2.5">
        {authorUsername ? (
          <Link href={`/author/${authorUsername}`} className="shrink-0">{avatar}</Link>
        ) : avatar}
        <div>
          {nameEl}
          {!compact && (
            <p className="text-[10px] text-[#767870] dark:text-[#464841] uppercase tracking-wider">
              {authorRole ?? 'Contributing Writer'}
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <span className="text-[#c6c7be] dark:text-[#464841]">·</span>

      {/* Date */}
      <div className="flex items-center gap-1.5 text-[#464841] dark:text-[#c6c7be]">
        <Calendar className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>{formatDate(publishedAt)}</span>
        {updatedAt && updatedAt !== publishedAt && (
          <span className="text-[#767870] dark:text-[#464841]">
            (updated {formatDate(updatedAt)})
          </span>
        )}
      </div>

      {/* Divider */}
      <span className="text-[#c6c7be] dark:text-[#464841]">·</span>

      {/* Reading time */}
      <div className="flex items-center gap-1.5 text-[#464841] dark:text-[#c6c7be]">
        <Clock className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>{readingTime} min read</span>
      </div>
    </div>
  )
}
