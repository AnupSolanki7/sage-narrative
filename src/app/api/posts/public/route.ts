import { NextResponse } from 'next/server'
import { getPublishedPosts } from '@/lib/db/posts'
import { dbPostToMockPost } from '@/types'

export async function GET() {
  try {
    const posts = await getPublishedPosts()
    return NextResponse.json({ posts: posts.map(dbPostToMockPost) })
  } catch {
    return NextResponse.json({ posts: [] })
  }
}
