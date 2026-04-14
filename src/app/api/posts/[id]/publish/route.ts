import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { publishPost, unpublishPost, getPostByIdAdmin } from '@/lib/db/posts'

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

    const post =
      existing.status === 'published'
        ? await unpublishPost(params.id)
        : await publishPost(params.id)

    return NextResponse.json({ post })
  } catch (error) {
    console.log(error);
    
    return NextResponse.json({ error: 'Failed to toggle publish status' }, { status: 500 })
  }
}
