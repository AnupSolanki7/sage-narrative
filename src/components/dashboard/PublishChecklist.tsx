'use client'

import { Check, Circle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ChecklistInput {
  title: string
  category?: string
  excerpt?: string
  coverImage?: string
  seoDescription?: string
  contentRaw: string
  previewed: boolean
}

interface ChecklistItem {
  label: string
  done: boolean
  /** "required" items block publish; "recommended" items just warn. */
  level: 'required' | 'recommended'
}

function buildItems(input: ChecklistInput): ChecklistItem[] {
  return [
    { label: 'Title added',                  done: !!input.title.trim(),          level: 'required'    },
    { label: 'Category selected',            done: !!input.category,              level: 'required'    },
    { label: 'Markdown body added',          done: !!input.contentRaw.trim(),     level: 'required'    },
    { label: 'Excerpt added',                done: !!input.excerpt?.trim(),       level: 'recommended' },
    { label: 'Cover image added',            done: !!input.coverImage?.trim(),    level: 'recommended' },
    { label: 'SEO description added',        done: !!input.seoDescription?.trim(),level: 'recommended' },
    { label: 'Preview reviewed',             done: input.previewed,               level: 'recommended' },
  ]
}

export function checklistStatus(input: ChecklistInput): {
  items: ChecklistItem[]
  requiredMet: boolean
  recommendedMissing: number
} {
  const items = buildItems(input)
  const requiredMet = items.filter((i) => i.level === 'required').every((i) => i.done)
  const recommendedMissing = items.filter((i) => i.level === 'recommended' && !i.done).length
  return { items, requiredMet, recommendedMissing }
}

interface Props extends ChecklistInput {
  className?: string
}

export default function PublishChecklist(props: Props) {
  const { items, requiredMet, recommendedMissing } = checklistStatus(props)

  return (
    <div
      className={cn(
        'bg-white dark:bg-[#1c2217] rounded-[1.5rem] border border-[#e0e5d2] dark:border-[#2d3226] p-6',
        props.className
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="font-semibold text-[#181d12] dark:text-[#f7fce9]">Before you publish</h2>
        {!requiredMet ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-3.5 h-3.5" />
            Required fields missing
          </span>
        ) : recommendedMissing > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[#f1f6e3] dark:bg-[#2d3226]/50 text-[#5b6300] dark:text-[#c2cf47]">
            {recommendedMissing} recommended item{recommendedMissing === 1 ? '' : 's'} pending
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
            <Check className="w-3.5 h-3.5" />
            Ready to publish
          </span>
        )}
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2.5 text-sm">
            {item.done ? (
              <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              </span>
            ) : (
              <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[#c6c7be] dark:text-[#464841]">
                <Circle className="w-3.5 h-3.5" />
              </span>
            )}
            <span className={cn(
              item.done
                ? 'text-[#181d12] dark:text-[#f7fce9]'
                : 'text-[#767870] dark:text-[#464841]'
            )}>
              {item.label}
            </span>
            {!item.done && item.level === 'required' && (
              <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-500 ml-auto">
                Required
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
