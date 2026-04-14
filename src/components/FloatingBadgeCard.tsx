import { Clock, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuthorBadgeProps {
  authorName: string
  authorInitials: string
  role?: string
  className?: string
}

export function AuthorBadge({ authorName, authorInitials, role, className }: AuthorBadgeProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 bg-white/95 dark:bg-[#1c2217]/95 backdrop-blur-sm',
        'rounded-full px-3 py-2 shadow-editorial border border-white/50 dark:border-[#2d3226]/50',
        className
      )}
    >
      <div className="w-8 h-8 rounded-full bg-[#5b6300] flex items-center justify-center text-white text-xs font-bold shrink-0">
        {authorInitials}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#181d12] dark:text-[#f7fce9] truncate">
          {authorName}
        </p>
        {role && (
          <p className="text-[10px] text-[#767870] dark:text-[#464841] truncate">{role}</p>
        )}
      </div>
    </div>
  )
}

interface StatsBadgeProps {
  readingTime: number
  featured?: boolean
  className?: string
}

export function StatsBadge({ readingTime, featured = false, className }: StatsBadgeProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 bg-[#181d12]/90 backdrop-blur-sm',
        'rounded-full px-3 py-2 shadow-editorial',
        className
      )}
    >
      {featured && (
        <div className="flex items-center gap-1.5 pr-2 border-r border-white/20">
          <Star className="w-3 h-3 text-[#d3e056] fill-[#d3e056]" />
          <span className="text-[10px] font-semibold text-[#d3e056] uppercase tracking-wider">
            Featured
          </span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <Clock className="w-3 h-3 text-white/70" />
        <span className="text-xs font-medium text-white/90">{readingTime} min read</span>
      </div>
    </div>
  )
}

// Composite component
interface FloatingBadgeCardProps {
  type: 'author' | 'stats'
  authorName?: string
  authorInitials?: string
  authorRole?: string
  readingTime?: number
  featured?: boolean
  className?: string
}

export default function FloatingBadgeCard({
  type,
  authorName,
  authorInitials,
  authorRole,
  readingTime,
  featured,
  className,
}: FloatingBadgeCardProps) {
  if (type === 'author' && authorName && authorInitials) {
    return (
      <AuthorBadge
        authorName={authorName}
        authorInitials={authorInitials}
        role={authorRole}
        className={className}
      />
    )
  }

  if (type === 'stats' && readingTime !== undefined) {
    return (
      <StatsBadge
        readingTime={readingTime}
        featured={featured}
        className={className}
      />
    )
  }

  return null
}
