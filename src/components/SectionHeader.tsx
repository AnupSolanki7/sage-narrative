import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: {
    label: string
    href: string
  }
  className?: string
  centered?: boolean
}

export default function SectionHeader({
  title,
  subtitle,
  action,
  className,
  centered = false,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-end justify-between gap-4 mb-8 md:mb-12',
        centered && 'flex-col items-center text-center',
        className
      )}
    >
      <div className={cn(centered && 'flex flex-col items-center')}>
        <h2 className="font-serif font-bold text-3xl md:text-4xl text-[#181d12] dark:text-[#f7fce9] leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-[#464841] dark:text-[#c6c7be] text-base md:text-lg max-w-xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {action && !centered && (
        <Link
          href={action.href}
          className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-[#5b6300] dark:text-[#c2cf47] hover:gap-2.5 transition-all group"
        >
          {action.label}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      {action && centered && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5b6300] dark:text-[#c2cf47] hover:gap-2.5 transition-all group mt-2"
        >
          {action.label}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
