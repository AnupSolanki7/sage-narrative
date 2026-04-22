import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getAllPostsAdmin, createPost } from '@/lib/db/posts'
import { parseMarkdownFile, generateSlugFromTitle } from '@/lib/markdown/parser'
import { connectDB } from '@/lib/db/mongodb'
import Post from '@/models/Post'
import Subscriber from '@/models/Subscriber'
import { sendNewPostNotification } from '@/lib/email/sender'
import type { DbPost, UserProfile } from '@/types'

export async function GET() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const posts = await getAllPostsAdmin()
    return NextResponse.json({ posts })
  } catch (err) {
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
    console.log(post);

    // ── Send new-post notification if created directly as published ────────────
    if (post.status === 'published') {
      // Resolve author name
      let authorName: string | undefined
      if (post.authorId && typeof post.authorId === 'object') {
        authorName = (post.authorId as UserProfile).name
      } else if (post.author) {
        authorName = post.author
      }

      await connectDB()
      const subscribers = await Subscriber.find({ status: 'active' }).select('email').lean()
      const recipients = (subscribers as { email: string }[]).map((s) => s.email)
      console.log(subscribers);

      sendNewPostNotification({
        postId: post._id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        authorName,
        coverImage: post.coverImage,
        category: post.category,
        readingTime: post.readingTime,
        recipients,
      }).catch((err) => {
        console.error('[posts/create] notification send error:', err)
      })

      // Mark notificationSent so the publish toggle won't re-fire
      Post.findByIdAndUpdate(post._id, { notificationSent: true }).catch(() => { })
    }
    // ──────────────────────────────────────────────────────────────────────────

    return NextResponse.json({ post }, { status: 201 })
  } catch (err: any) {
    if (err?.code === 11000) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
    }
    console.log(err)
    return NextResponse.json({ error: err?.message ?? 'Failed to create post' }, { status: 500 })
  }
}
