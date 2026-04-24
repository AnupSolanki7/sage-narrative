import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { publishPost, unpublishPost, getPostByIdAdmin } from '@/lib/db/posts'
import { notifyNewPostIfNeeded } from '@/lib/email/notifyNewPost'

interface Params {
  params: { id: string }
}

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const existing = await getPostByIdAdmin(params.id)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const wasPublished = existing.status === 'published'

    const post = wasPublished
      ? await unpublishPost(params.id)
      : await publishPost(params.id)

    if (!post) {
      return NextResponse.json({ error: 'Failed to toggle publish status' }, { status: 500 })
    }

    // Only fire on draft → published. Helper dedupes via notificationSent.
    if (!wasPublished && post.status === 'published') {
      await notifyNewPostIfNeeded(post)
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('[publish] error:', error)
    return NextResponse.json({ error: 'Failed to toggle publish status' }, { status: 500 })
  }
}
