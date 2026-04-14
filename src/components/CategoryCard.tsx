import Link from 'next/link'
import { BookOpen, Cpu, Lightbulb, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CategoryCardProps {
  type: 'stories' | 'tech' | 'insights'
  postCount?: number
  className?: string
}

const config = {
  stories: {
    icon: BookOpen,
    title: 'Stories',
    description:
      'Human narratives exploring the texture of contemporary life, memory, and the spaces between us.',
    href: '/stories',
    accentBg: 'bg-[#d3e056]',
    accentText: 'text-[#5a6200]',
    iconBg: 'bg-[#d3e056]',
    border: 'border-[#d3e056]/40',
    hoverBorder: 'hover:border-[#d3e056]',
  },
  tech: {
    icon: Cpu,
    title: 'Tech',
    description:
      'Deep dives into software, AI, and the cultural implications of the tools shaping our world.',
    href: '/tech',
    accentBg: 'bg-[#c2d9f0]',
    accentText: 'text-[#1a3a5c]',
    iconBg: 'bg-[#c2d9f0]',
    border: 'border-[#c2d9f0]/40',
    hoverBorder: 'hover:border-[#c2d9f0]',
  },
  insights: {
    icon: Lightbulb,
    title: 'Insights',
    description:
      'Philosophical essays on attention, creativity, productivity, and living thoughtfully.',
    href: '/insights',
    accentBg: 'bg-[#f0d9c2]',
    accentText: 'text-[#5c3a1a]',
    iconBg: 'bg-[#f0d9c2]',
    border: 'border-[#f0d9c2]/40',
    hoverBorder: 'hover:border-[#f0d9c2]',
  },
}

export default function CategoryCard({ type, postCount, className }: CategoryCardProps) {
  const { icon: Icon, title, description, href, accentBg, accentText, iconBg, border, hoverBorder } = config[type]

  return (
    <Link href={href} className={cn('group block', className)}>
      <div
        className={cn(
          'relative h-full rounded-[1rem] border-2 bg-white dark:bg-[#1c2217] p-6 md:p-7',
          'transition-all duration-300',
          'hover:shadow-premium hover:-translate-y-1',
          border,
          hoverBorder
        )}
      >
        {/* Icon */}
        <div className={cn('w-11 h-11 rounded-[0.75rem] flex items-center justify-center mb-5', iconBg)}>
          <Icon className={cn('w-5 h-5', accentText)} />
        </div>

        {/* Content */}
        <h3 className="font-serif font-bold text-xl text-[#181d12] dark:text-[#f7fce9] mb-2 group-hover:text-[#5b6300] dark:group-hover:text-[#c2cf47] transition-colors">
          {title}
        </h3>
        <p className="text-sm text-[#464841] dark:text-[#c6c7be] leading-relaxed mb-5">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {postCount !== undefined && (
            <span className={cn('text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full', accentBg, accentText)}>
              {postCount} {postCount === 1 ? 'piece' : 'pieces'}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5b6300] dark:text-[#c2cf47] ml-auto group-hover:gap-2.5 transition-all">
            Explore
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>

        {/* Decorative dot */}
        <div className={cn('absolute top-5 right-5 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity', accentBg)} />
      </div>
    </Link>
  )
}
