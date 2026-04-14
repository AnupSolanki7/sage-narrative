import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/session'
import { getUserPostById, updateUserPost, deleteUserPost } from '@/lib/db/posts'
import { parseMarkdownFile } from '@/lib/markdown/parser'

interface Params { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireUser()
    const post = await getUserPostById(params.id, session.userId!)
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ post })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await requireUser()
    const body = await req.json()

    // Regenerate HTML if raw markdown changed
    if (body.contentRaw) {
      const parsed = await parseMarkdownFile(body.contentRaw)
      body.contentHtml = parsed.contentHtml
      body.contentRaw  = parsed.contentRaw
      if (!body.readingTime) body.readingTime = parsed.readingTime
    }

    const post = await updateUserPost(params.id, session.userId!, body)
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ post })
  } catch (err: unknown) {
    const e = err as { code?: number; message?: string }
    if (e?.code === 11000) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: e?.message ?? 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireUser()
    const deleted = await deleteUserPost(params.id, session.userId!)
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
