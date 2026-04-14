import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/session'
import { toggleUserPostPublish } from '@/lib/db/posts'

interface Params { params: { id: string } }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireUser()
    const post = await toggleUserPostPublish(params.id, session.userId!)
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ post })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
