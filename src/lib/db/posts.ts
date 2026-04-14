import { connectDB } from './mongodb'
import Post, { IPost } from '@/models/Post'
// User must be imported so Mongoose registers the model before any populate('authorId') call
import '@/models/User'
import type { DbPost, DbPostSummary, PostCategory, UserProfile } from '@/types'

// ── Serialisation ─────────────────────────────────────────────────────────────

const USER_SELECT = 'name username avatar bio socialLinks role createdAt updatedAt'

function resolveAuthorId(raw: unknown): string | UserProfile | undefined {
  if (!raw) return undefined
  if (typeof raw === 'object' && raw !== null && '_id' in raw) {
    const u = raw as Record<string, unknown>
    return {
      _id:         String(u._id),
      name:        String(u.name ?? ''),
      username:    String(u.username ?? ''),
      avatar:      u.avatar ? String(u.avatar) : undefined,
      bio:         u.bio ? String(u.bio) : undefined,
      socialLinks: u.socialLinks as UserProfile['socialLinks'],
      role:        (u.role as 'user' | 'admin') ?? 'user',
      createdAt:   u.createdAt ? String(u.createdAt) : '',
      updatedAt:   u.updatedAt ? String(u.updatedAt) : '',
    }
  }
  return String(raw)
}

function toDbPost(doc: IPost): DbPost {
  const obj = doc.toObject({ versionKey: false, populate: true })
  return {
    _id:            obj._id.toString(),
    title:          obj.title,
    subtitle:       obj.subtitle,
    excerpt:        obj.excerpt,
    slug:           obj.slug,
    category:       obj.category,
    tags:           obj.tags ?? [],
    coverImage:     obj.coverImage,
    contentRaw:     obj.contentRaw,
    contentHtml:    obj.contentHtml,
    author:         obj.author,
    authorId:       resolveAuthorId(obj.authorId),
    publishedAt:    obj.publishedAt?.toISOString(),
    featured:       obj.featured,
    seoTitle:       obj.seoTitle,
    seoDescription: obj.seoDescription,
    status:         obj.status,
    readingTime:    obj.readingTime,
    postType:       obj.postType,
    createdAt:      obj.createdAt.toISOString(),
    updatedAt:      obj.updatedAt.toISOString(),
  }
}

function toSummary(doc: IPost): DbPostSummary {
  const { contentRaw: _r, contentHtml: _h, ...summary } = toDbPost(doc)
  return summary
}

// ── Public queries ────────────────────────────────────────────────────────────

export async function getPublishedPosts(limit?: number): Promise<DbPostSummary[]> {
  await connectDB()
  const query = Post
    .find({ status: 'published' })
    .populate('authorId', USER_SELECT)
    .sort({ publishedAt: -1, createdAt: -1 })
  if (limit) query.limit(limit)
  const docs = await query.exec()
  return docs.map(toSummary)
}

export async function getFeaturedPost(): Promise<DbPostSummary | null> {
  await connectDB()
  const doc = await Post
    .findOne({ status: 'published', featured: true })
    .populate('authorId', USER_SELECT)
    .sort({ publishedAt: -1 })
  if (!doc) return null
  return toSummary(doc)
}

export async function getPostBySlug(slug: string): Promise<DbPost | null> {
  await connectDB()
  const doc = await Post
    .findOne({ slug, status: 'published' })
    .populate('authorId', USER_SELECT)
  if (!doc) return null
  return toDbPost(doc)
}

export async function getPostsByCategory(
  category: PostCategory,
  limit?: number
): Promise<DbPostSummary[]> {
  await connectDB()
  const query = Post
    .find({ category, status: 'published' })
    .populate('authorId', USER_SELECT)
    .sort({ publishedAt: -1 })
  if (limit) query.limit(limit)
  const docs = await query.exec()
  return docs.map(toSummary)
}

export async function getRelatedPosts(
  category: PostCategory,
  excludeSlug: string,
  limit = 3
): Promise<DbPostSummary[]> {
  await connectDB()
  const docs = await Post
    .find({ category, slug: { $ne: excludeSlug }, status: 'published' })
    .populate('authorId', USER_SELECT)
    .sort({ publishedAt: -1 })
    .limit(limit)
  return docs.map(toSummary)
}

export async function getPostsByAuthor(
  authorId: string,
  limit?: number
): Promise<DbPostSummary[]> {
  await connectDB()
  const query = Post
    .find({ authorId, status: 'published' })
    .populate('authorId', USER_SELECT)
    .sort({ publishedAt: -1 })
  if (limit) query.limit(limit)
  const docs = await query.exec()
  return docs.map(toSummary)
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  await connectDB()
  const docs = await Post.find({ status: 'published' }).select('slug').lean()
  return docs.map((d: unknown) => (d as { slug: string }).slug)
}

// ── Admin queries (all posts, no author filter) ───────────────────────────────

export async function getAllPostsAdmin(): Promise<DbPostSummary[]> {
  await connectDB()
  const docs = await Post
    .find({})
    .populate('authorId', USER_SELECT)
    .sort({ createdAt: -1 })
  return docs.map(toSummary)
}

export async function getPostByIdAdmin(id: string): Promise<DbPost | null> {
  await connectDB()
  const doc = await Post.findById(id).populate('authorId', USER_SELECT)
  if (!doc) return null
  return toDbPost(doc)
}

// ── User-scoped queries (dashboard) ──────────────────────────────────────────

export async function getUserPosts(authorId: string): Promise<DbPostSummary[]> {
  await connectDB()
  const docs = await Post
    .find({ authorId })
    .populate('authorId', USER_SELECT)
    .sort({ createdAt: -1 })
  return docs.map(toSummary)
}

export async function getUserPostById(
  postId: string,
  authorId: string
): Promise<DbPost | null> {
  await connectDB()
  const doc = await Post
    .findOne({ _id: postId, authorId })
    .populate('authorId', USER_SELECT)
  if (!doc) return null
  return toDbPost(doc)
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createPost(
  data: Omit<DbPost, '_id' | 'createdAt' | 'updatedAt'>
): Promise<DbPost> {
  await connectDB()
  const doc = await Post.create(data)
  const populated = await doc.populate('authorId', USER_SELECT)
  return toDbPost(populated)
}

export async function updatePost(
  id: string,
  data: Partial<Omit<DbPost, '_id' | 'createdAt' | 'updatedAt'>>
): Promise<DbPost | null> {
  await connectDB()
  const doc = await Post
    .findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('authorId', USER_SELECT)
  if (!doc) return null
  return toDbPost(doc)
}

export async function updateUserPost(
  postId: string,
  authorId: string,
  data: Partial<Omit<DbPost, '_id' | 'createdAt' | 'updatedAt'>>
): Promise<DbPost | null> {
  await connectDB()
  const doc = await Post
    .findOneAndUpdate({ _id: postId, authorId }, data, { new: true, runValidators: true })
    .populate('authorId', USER_SELECT)
  if (!doc) return null
  return toDbPost(doc)
}

export async function deletePost(id: string): Promise<boolean> {
  await connectDB()
  const result = await Post.findByIdAndDelete(id)
  return !!result
}

export async function deleteUserPost(
  postId: string,
  authorId: string
): Promise<boolean> {
  await connectDB()
  const result = await Post.findOneAndDelete({ _id: postId, authorId })
  return !!result
}

export async function publishPost(id: string): Promise<DbPost | null> {
  await connectDB()
  const doc = await Post
    .findByIdAndUpdate(id, { status: 'published', publishedAt: new Date() }, { new: true })
    .populate('authorId', USER_SELECT)
  if (!doc) return null
  return toDbPost(doc)
}

export async function unpublishPost(id: string): Promise<DbPost | null> {
  await connectDB()
  const doc = await Post
    .findByIdAndUpdate(id, { status: 'draft' }, { new: true })
    .populate('authorId', USER_SELECT)
  if (!doc) return null
  return toDbPost(doc)
}

export async function toggleUserPostPublish(
  postId: string,
  authorId: string
): Promise<DbPost | null> {
  await connectDB()
  const current = await Post.findOne({ _id: postId, authorId })
  if (!current) return null

  const isPublished = current.status === 'published'
  const doc = await Post
    .findByIdAndUpdate(
      postId,
      isPublished
        ? { status: 'draft' }
        : { status: 'published', publishedAt: new Date() },
      { new: true }
    )
    .populate('authorId', USER_SELECT)
  if (!doc) return null
  return toDbPost(doc)
}

export async function getPostStats(): Promise<{
  total: number
  published: number
  drafts: number
}> {
  await connectDB()
  const [total, published] = await Promise.all([
    Post.countDocuments(),
    Post.countDocuments({ status: 'published' }),
  ])
  return { total, published, drafts: total - published }
}

export async function getUserPostStats(authorId: string): Promise<{
  total: number
  published: number
  drafts: number
}> {
  await connectDB()
  const [total, published] = await Promise.all([
    Post.countDocuments({ authorId }),
    Post.countDocuments({ authorId, status: 'published' }),
  ])
  return { total, published, drafts: total - published }
}
