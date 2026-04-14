import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/session'
import { getUserPosts, createPost } from '@/lib/db/posts'
import { parseMarkdownFile, generateSlugFromTitle } from '@/lib/markdown/parser'
import type { DbPost } from '@/types'

export async function GET() {
  try {
    const session = await requireUser()
    const posts = await getUserPosts(session.userId!)
    return NextResponse.json({ posts })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser()
    const body = await req.json()

    if (!body.title || !body.slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
    }

    // Server-side HTML generation from raw markdown
    if (body.contentRaw && !body.contentHtml) {
      const parsed = await parseMarkdownFile(body.contentRaw)
      body.contentHtml = parsed.contentHtml
      body.contentRaw  = parsed.contentRaw
      if (!body.readingTime) body.readingTime = parsed.readingTime
      if (!body.slug && body.title) body.slug = generateSlugFromTitle(body.title)
    }

    const post = await createPost({
      ...(body as Omit<DbPost, '_id' | 'createdAt' | 'updatedAt'>),
      authorId: session.userId!,
      author:   session.userName ?? session.userEmail ?? '',
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (err: unknown) {
    const e = err as { code?: number; message?: string }
    if (e?.code === 11000) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: e?.message ?? 'Failed to create post' }, { status: 500 })
  }
}
