import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { publishPost, unpublishPost, getPostByIdAdmin } from '@/lib/db/posts'
import { connectDB } from '@/lib/db/mongodb'
import Post from '@/models/Post'
import Subscriber from '@/models/Subscriber'
import { sendNewPostNotification } from '@/lib/email/sender'
import type { UserProfile } from '@/types'

interface Params {
  params: { id: string }
}

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const existing = await getPostByIdAdmin(params.id)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Determine transition direction
    const wasPublished = existing.status === 'published'

    const post = wasPublished
      ? await unpublishPost(params.id)
      : await publishPost(params.id)

    if (!post) {
      return NextResponse.json({ error: 'Failed to toggle publish status' }, { status: 500 })
    }

    // ── Send new-post notification ─────────────────────────────────────────────
    // Only fire when:
    //   1. Post just transitioned from draft → published (wasPublished === false)
    //   2. notificationSent is still false (prevents duplicate blasts on re-publish)
    if (!wasPublished && !existing.notificationSent) {
      // Resolve author name for the email
      let authorName: string | undefined
      if (existing.authorId && typeof existing.authorId === 'object') {
        authorName = (existing.authorId as UserProfile).name
      } else if (existing.author) {
        authorName = existing.author
      }

      // Fetch all active subscriber emails
      const subscribers = await Subscriber.find({ status: 'active' }).select('email').lean()
      const recipients = (subscribers as { email: string }[]).map((s) => s.email)

      // Dispatch notification (non-blocking on failure)
      sendNewPostNotification({
        postId:      existing._id,
        title:       existing.title,
        slug:        existing.slug,
        excerpt:     existing.excerpt,
        authorName,
        coverImage:  existing.coverImage,
        category:    existing.category,
        readingTime: existing.readingTime,
        recipients,
      }).catch((err) => {
        console.error('[publish] notification send error:', err)
      })

      // Mark notificationSent regardless of email success — prevents retry blasts
      await Post.findByIdAndUpdate(params.id, { notificationSent: true })
    }
    // ──────────────────────────────────────────────────────────────────────────

    return NextResponse.json({ post })
  } catch (error) {
    console.error('[publish] error:', error)
    return NextResponse.json({ error: 'Failed to toggle publish status' }, { status: 500 })
  }
}
