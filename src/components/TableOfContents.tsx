'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { BookOpen } from 'lucide-react'

interface TOCItem {
  id: string
  title: string
  level: number
}

interface TableOfContentsProps {
  contentHtml: string
}

function extractHeadingsFromHtml(html: string): TOCItem[] {
  // Parse h2 and h3 elements with their id attributes from the HTML string
  const pattern = /<h([23])[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h[23]>/gi
  const items: TOCItem[] = []
  let match: RegExpExecArray | null

  while ((match = pattern.exec(html)) !== null) {
    const level = parseInt(match[1], 10)
    const id = match[2]
    // Strip any inner HTML tags (e.g. anchor links added by rehype-autolink-headings)
    const title = match[3].replace(/<[^>]+>/g, '').trim()
    if (id && title) {
      items.push({ id, title, level })
    }
  }

  return items
}

export default function TableOfContents({ contentHtml }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const headings = extractHeadingsFromHtml(contentHtml)

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headings.length])

  if (headings.length < 2) return null

  return (
    <nav className="bg-[#fafdf4] dark:bg-[#1c2217] rounded-[1.25rem] border border-[#dde8c8] dark:border-[#2d3226] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#e6edcf] dark:border-[#2d3226]">
        <div className="w-6 h-6 rounded-md bg-[#ebf0dd] dark:bg-[#2d3226] flex items-center justify-center shrink-0">
          <BookOpen className="w-3.5 h-3.5 text-[#5b6300] dark:text-[#c2cf47]" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#767870] dark:text-[#464841]">
          In this article
        </span>
      </div>

      {/* Items */}
      <div className="px-3 py-3">
        {/* Vertical guide rail */}
        <div className="relative pl-3 border-l border-[#e0e5d2] dark:border-[#2d3226] space-y-0.5">
          {headings.map((item) => {
            const isActive = activeId === item.id
            return (
              <div key={item.id} className="relative">
                {/* Active left accent */}
                {isActive && (
                  <span className="absolute -left-[13px] top-1/2 -translate-y-1/2 w-[2px] h-4 bg-[#5b6300] dark:bg-[#c2cf47] rounded-full" />
                )}
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    const el = document.getElementById(item.id)
                    if (el) {
                      const top = el.getBoundingClientRect().top + window.scrollY - 100
                      window.scrollTo({ top, behavior: 'smooth' })
                    }
                  }}
                  className={cn(
                    'block rounded-md px-2.5 py-1.5 leading-snug transition-all duration-150',
                    item.level === 3 ? 'text-xs ml-3' : 'text-sm',
                    isActive
                      ? 'text-[#4a5200] dark:text-[#c2cf47] font-semibold bg-[#eef3d8] dark:bg-[#2d3226]/70'
                      : 'text-[#464841] dark:text-[#8a9080] hover:text-[#3a4400] dark:hover:text-[#c6c7be] hover:bg-[#f1f6e3] dark:hover:bg-[#2d3226]/40'
                  )}
                >
                  {item.title}
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
