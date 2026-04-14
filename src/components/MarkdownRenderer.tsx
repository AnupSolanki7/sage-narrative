import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  contentHtml: string
  className?: string
}

/**
 * Renders server-generated HTML from our trusted markdown pipeline.
 * Styled to match the existing premium editorial design system.
 */
export default function MarkdownRenderer({ contentHtml, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn('article-body', className)}
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  )
}
