import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { AuthorBadge, StatsBadge } from './FloatingBadgeCard'
import { cn, formatDate } from '@/lib/utils'
import type { MockPost } from '@/types'

interface FeaturedVisualCardProps {
  post?: MockPost | null
  className?: string
}

export default function FeaturedVisualCard({ post, className }: FeaturedVisualCardProps) {
  const title = post?.title ?? 'Crafting Stories at the Edge of Technology'
  const excerpt = post?.excerpt ?? 'A curated selection of our most resonant long-form essays.'
  const href = post ? `/blog/${post.slug}` : '#'
  const category = post?.category ?? 'Featured'
  const readingTime = post?.readingTime ?? 8
  const authorName = post?.author.name ?? 'Editorial Team'
  const authorInitials = post?.author.initials ?? 'ET'
  const publishedAt = post?.publishedAt ?? new Date().toISOString()
  const coverImageUrl = post?.coverImageUrl

  return (
    <div className={cn('relative h-[500px] md:h-[580px]', className)}>
      <Link href={href} className="block h-full group">
        {/* Main card */}
        <div className="relative h-full rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#2d3226] to-[#181d12] shadow-float">
          {/* Background image */}
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={title}
              fill
              className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          ) : (
            // Decorative gradient placeholder
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2d3226] via-[#3d4a30] to-[#1a2015]" />
              {/* Decorative circles */}
              <div className="absolute top-8 right-8 w-48 h-48 rounded-full bg-[#d3e056]/10 blur-2xl" />
              <div className="absolute bottom-12 left-8 w-36 h-36 rounded-full bg-[#c2cf47]/8 blur-xl" />
              <div className="absolute top-1/3 left-1/4 w-24 h-24 rounded-full bg-[#5b6300]/20 blur-lg" />
              {/* Grid pattern */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: 'radial-gradient(circle, #d3e056 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Category badge — top left */}
          <div className="absolute top-5 left-5">
            <span className="inline-flex items-center text-xs font-semibold uppercase tracking-widest bg-[#d3e056] text-[#5a6200] px-3 py-1.5 rounded-full">
              {category}
            </span>
          </div>

          {/* Content — bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <h3 className="font-serif font-bold text-white text-xl md:text-2xl leading-snug mb-3 group-hover:text-[#d3e056] transition-colors">
              {title}
            </h3>
            <p className="text-white/70 text-sm leading-relaxed mb-4 line-clamp-2">
              {excerpt}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs">{formatDate(publishedAt)}</span>
              <span className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-[#d3e056] group-hover:border-[#d3e056] transition-all">
                <ArrowUpRight className="w-4 h-4 text-white group-hover:text-[#5a6200] transition-colors" />
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Floating author badge */}
      <div className="absolute -top-4 -right-4 md:top-auto md:-bottom-4 md:-right-4 z-10">
        <AuthorBadge
          authorName={authorName ?? 'Author'}
          authorInitials={authorInitials}
          role="Contributing Author"
          className="shadow-float"
        />
      </div>

      {/* Floating stats badge */}
      <div className="absolute -bottom-4 left-6 md:-bottom-4 z-10">
        <StatsBadge readingTime={readingTime} featured className="shadow-float" />
      </div>
    </div>
  )
}
