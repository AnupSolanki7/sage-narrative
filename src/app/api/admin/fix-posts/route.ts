/**
 * POST /api/admin/fix-posts
 *
 * One-time migration: finds every post whose contentRaw or contentHtml still
 * contains a YAML frontmatter block and re-renders it cleanly.
 *
 * Safe to run multiple times — posts without frontmatter are skipped.
 */
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { connectDB } from '@/lib/db/mongodb'
import Post from '@/models/Post'
import { parseMarkdownFile } from '@/lib/markdown/parser'
export const dynamic = 'force-dynamic'

function hasFrontmatter(text: string): boolean {
  return typeof text === 'string' && text.trimStart().startsWith('---')
}

export async function POST() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const posts = await Post.find({}).select('_id contentRaw contentHtml')
  const results = { checked: 0, fixed: 0, errors: 0 }

  for (const post of posts) {
    results.checked++

    const needsFix =
      hasFrontmatter(post.contentRaw) || hasFrontmatter(post.contentHtml)

    if (!needsFix) continue

    try {
      // Use contentRaw as the source of truth; fall back to contentHtml if
      // contentRaw is empty or was incorrectly stored as HTML.
      const source =
        hasFrontmatter(post.contentRaw)
          ? post.contentRaw
          : post.contentHtml

      const parsed = await parseMarkdownFile(source)

      await Post.findByIdAndUpdate(post._id, {
        contentRaw: parsed.contentRaw,
        contentHtml: parsed.contentHtml,
        readingTime: parsed.readingTime,
      })

      results.fixed++
    } catch {
      results.errors++
    }
  }

  return NextResponse.json({
    message: `Done. Checked ${results.checked}, fixed ${results.fixed}, errors ${results.errors}.`,
    ...results,
  })
}
