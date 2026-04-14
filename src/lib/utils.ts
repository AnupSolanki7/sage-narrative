import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function calculateReadingTime(body: any[]): number {
  if (!body || !Array.isArray(body)) return 5
  const text = body
    .map((block: any) =>
      block.children?.map((child: any) => child.text ?? '').join(' ') ?? ''
    )
    .join(' ')
  const wordCount = text.split(/\s+/).filter(Boolean).length
  return Math.ceil(wordCount / 200) || 5
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function getCategoryColor(category: string): string {
  const lower = category.toLowerCase()
  if (lower === 'stories' || lower === 'story') return '#d3e056'
  if (lower === 'tech') return '#c2d9f0'
  if (lower === 'insights' || lower === 'insight') return '#f0d9c2'
  return '#d3e056'
}

export function getCategorySlug(category: string): string {
  const lower = category.toLowerCase()
  if (lower === 'stories' || lower === 'story') return 'stories'
  if (lower === 'tech') return 'tech'
  if (lower === 'insights' || lower === 'insight') return 'insights'
  return lower
}
