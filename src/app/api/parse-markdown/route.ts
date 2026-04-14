import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { parseMarkdownFile, generateSlugFromTitle } from '@/lib/markdown/parser'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      return NextResponse.json({ error: 'File must be a .md or .markdown file' }, { status: 400 })
    }

    const content = await file.text()
    const parsed = await parseMarkdownFile(content)

    // Auto-generate slug from title if not provided
    if (!parsed.frontmatter.slug && parsed.frontmatter.title) {
      parsed.frontmatter.slug = generateSlugFromTitle(parsed.frontmatter.title)
    }

    return NextResponse.json({
      frontmatter: parsed.frontmatter,
      contentHtml: parsed.contentHtml,
      contentRaw: parsed.contentRaw,
      readingTime: parsed.readingTime,
      errors: parsed.errors,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Failed to parse markdown file' },
      { status: 500 }
    )
  }
}
