import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import ArticleMeta from './ArticleMeta'
import { cn, getCategorySlug } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href: string
}

interface ArticleHeaderProps {
  title?: string
  subtitle?: string
  category?: string
  categorySlug?: string
  authorName?: string
  authorInitials?: string
  authorAvatar?: string
  authorUsername?: string
  publishedAt?: string
  readingTime?: number
  breadcrumbs?: BreadcrumbItem[]
  className?: string
}

export default function ArticleHeader({
  title,
  subtitle,
  category,
  categorySlug,
  authorName,
  authorInitials,
  authorAvatar,
  authorUsername,
  publishedAt,
  readingTime,
  breadcrumbs,
  className,
}: ArticleHeaderProps) {
  const resolvedTitle = title ?? ''
  const resolvedSubtitle = subtitle
  const resolvedCategory = category ?? 'Article'
  const resolvedCategorySlug = categorySlug ?? getCategorySlug(resolvedCategory)
  const resolvedAuthorName = authorName ?? 'Author'
  const resolvedAuthorInitials = authorInitials ?? 'A'
  const resolvedPublishedAt = publishedAt ?? new Date().toISOString()
  const resolvedReadingTime = readingTime ?? 5

  const defaultBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: resolvedCategory, href: `/${resolvedCategorySlug}` },
    { label: resolvedTitle, href: '#' },
  ]

  const crumbs = breadcrumbs ?? defaultBreadcrumbs

  const categoryColorMap: Record<string, string> = {
    stories: 'bg-[#d3e056] text-[#5a6200]',
    story: 'bg-[#d3e056] text-[#5a6200]',
    tech: 'bg-[#c2d9f0] text-[#1a3a5c]',
    insights: 'bg-[#f0d9c2] text-[#5c3a1a]',
    insight: 'bg-[#f0d9c2] text-[#5c3a1a]',
  }
  const categoryColor = categoryColorMap[resolvedCategorySlug.toLowerCase()] ?? 'bg-[#d3e056] text-[#5a6200]'

  return (
    <header className={cn('mb-8 md:mb-12', className)}>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-[#767870] dark:text-[#464841] mb-6 flex-wrap">
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i === 0 && <Home className="w-3 h-3 shrink-0" />}
            {i < crumbs.length - 1 ? (
              <>
                <Link
                  href={crumb.href}
                  className="hover:text-[#5b6300] dark:hover:text-[#c2cf47] transition-colors"
                >
                  {crumb.label}
                </Link>
                <ChevronRight className="w-3 h-3 shrink-0" />
              </>
            ) : (
              <span className="text-[#464841] dark:text-[#c6c7be] truncate max-w-[200px]">
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      {/* Category badge */}
      <div className="mb-4">
        <Link
          href={`/${resolvedCategorySlug}`}
          className={cn(
            'inline-flex items-center text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full',
            categoryColor
          )}
        >
          {resolvedCategory}
        </Link>
      </div>

      {/* Title */}
      <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-[#181d12] dark:text-[#f7fce9] mb-4 text-balance">
        {resolvedTitle}
      </h1>

      {/* Subtitle */}
      {resolvedSubtitle && (
        <p className="text-xl md:text-2xl text-[#464841] dark:text-[#c6c7be] leading-relaxed mb-6 max-w-2xl font-light">
          {resolvedSubtitle}
        </p>
      )}

      {/* Meta */}
      <ArticleMeta
        authorName={resolvedAuthorName}
        authorInitials={resolvedAuthorInitials}
        authorAvatar={authorAvatar}
        authorUsername={authorUsername}
        publishedAt={resolvedPublishedAt}
        readingTime={resolvedReadingTime}
      />
    </header>
  )
}
