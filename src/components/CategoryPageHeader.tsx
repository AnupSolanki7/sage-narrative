import { cn } from '@/lib/utils'
import { BookOpen, Cpu, Lightbulb } from 'lucide-react'

interface CategoryPageHeaderProps {
  category: 'stories' | 'tech' | 'insights'
  postCount?: number
  className?: string
}

const config = {
  stories: {
    icon: BookOpen,
    title: 'Stories',
    subtitle: 'Human narratives',
    description:
      'Long-form explorations of contemporary life, memory, culture, and the spaces between people. Essays that honor the complexity of lived experience.',
    accent: 'bg-[#d3e056] text-[#5a6200]',
    accentBg: 'from-[#f7fce9] to-[#ebf0dd] dark:from-[#181d12] dark:to-[#2d3226]',
  },
  tech: {
    icon: Cpu,
    title: 'Tech',
    subtitle: 'Technology & culture',
    description:
      'Deep investigations into software, artificial intelligence, digital culture, and the human implications of the systems we build and inhabit.',
    accent: 'bg-[#c2d9f0] text-[#1a3a5c]',
    accentBg: 'from-[#f0f7fe] to-[#ddeeff] dark:from-[#0d1520] dark:to-[#142030]',
  },
  insights: {
    icon: Lightbulb,
    title: 'Insights',
    subtitle: 'Philosophy & reflection',
    description:
      'Philosophical essays on attention, creativity, the examined life, and how to navigate an accelerating world with intentionality and depth.',
    accent: 'bg-[#f0d9c2] text-[#5c3a1a]',
    accentBg: 'from-[#fef8f0] to-[#f5e8d5] dark:from-[#1a1008] dark:to-[#2a1a0e]',
  },
}

export default function CategoryPageHeader({ category, postCount, className }: CategoryPageHeaderProps) {
  const { icon: Icon, title, subtitle, description, accent, accentBg } = config[category]

  return (
    <header className={cn('relative overflow-hidden', className)}>
      <div className={cn('bg-gradient-to-br', accentBg, 'px-4 md:px-8 py-16 md:py-24')}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-5 max-w-3xl">
            {/* Icon */}
            <div className={cn('w-14 h-14 rounded-[1rem] flex items-center justify-center shrink-0 mt-1', accent)}>
              <Icon className="w-6 h-6" />
            </div>

            <div>
              {/* Label */}
              <p className="text-xs font-semibold uppercase tracking-widest text-[#767870] dark:text-[#464841] mb-2">
                {subtitle}
              </p>

              {/* Title */}
              <h1 className="font-serif font-bold text-5xl md:text-6xl lg:text-7xl text-[#181d12] dark:text-[#f7fce9] leading-tight mb-4">
                {title}
              </h1>

              {/* Description */}
              <p className="text-lg md:text-xl text-[#464841] dark:text-[#c6c7be] leading-relaxed max-w-2xl mb-5">
                {description}
              </p>

              {/* Post count badge */}
              {postCount !== undefined && (
                <div className="inline-flex items-center gap-2">
                  <span className={cn('text-sm font-semibold px-4 py-2 rounded-full', accent)}>
                    {postCount} {postCount === 1 ? 'essay' : 'essays'} published
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--background)] to-transparent" />
    </header>
  )
}
