import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getAllPostsAdmin, createPost } from '@/lib/db/posts'
import { parseMarkdownFile, generateSlugFromTitle } from '@/lib/markdown/parser'
import { notifyNewPostIfNeeded } from '@/lib/email/notifyNewPost'
import type { DbPost } from '@/types'

export async function GET() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const posts = await getAllPostsAdmin()
    return NextResponse.json({ posts })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()

    // If the client sent raw markdown but no rendered HTML, generate it now
    if (body.contentRaw && !body.contentHtml) {
      const parsed = await parseMarkdownFile(body.contentRaw)
      body.contentHtml = parsed.contentHtml
      if (!body.readingTime) body.readingTime = parsed.readingTime
      if (!body.slug && body.title) body.slug = generateSlugFromTitle(body.title)
    }

    const post = await createPost(body as Omit<DbPost, '_id' | 'createdAt' | 'updatedAt'>)

    // Dispatch notification if created as published. No-op for drafts.
    await notifyNewPostIfNeeded(post)

    return NextResponse.json({ post }, { status: 201 })
  } catch (err: unknown) {
    const e = err as { code?: number; message?: string }
    if (e?.code === 11000) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
    }
    console.error(err)
    return NextResponse.json({ error: e?.message ?? 'Failed to create post' }, { status: 500 })
  }
}
