import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { parseMarkdownFile } from '@/lib/markdown/parser'

/**
 * POST /api/markdown/preview
 *
 * Renders unsaved Markdown into HTML using the same server pipeline used at
 * publish time, so the preview matches exactly what readers will see.
 *
 *   Body:    { markdown: string }
 *   Returns: { contentHtml: string, readingTime: number }
 */
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { markdown?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const markdown = typeof body.markdown === 'string' ? body.markdown : ''
  if (!markdown.trim()) {
    return NextResponse.json({ contentHtml: '', readingTime: 0 })
  }

  try {
    const parsed = await parseMarkdownFile(markdown)
    return NextResponse.json({
      contentHtml: parsed.contentHtml,
      readingTime: parsed.readingTime,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to render preview'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
