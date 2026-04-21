// ─── User types ───────────────────────────────────────────────────────────────

export interface DbUser {
  _id: string
  name: string
  username: string
  email: string
  avatar?: string
  bio?: string
  socialLinks?: {
    twitter?: string
    github?: string
    website?: string
    linkedin?: string
  }
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

/** Public-facing profile (no email). */
export type UserProfile = Omit<DbUser, 'email'>

// ─── Post types (MongoDB-backed) ─────────────────────────────────────────────

export type PostCategory = 'stories' | 'tech' | 'insights'
export type PostType     = 'story' | 'tech' | 'insight'
export type PostStatus   = 'draft' | 'published'

export interface DbPost {
  _id: string
  title: string
  subtitle?: string
  excerpt?: string
  slug: string
  category: PostCategory
  tags: string[]
  coverImage?: string
  contentRaw: string
  contentHtml: string
  /** Legacy string author (old admin posts). */
  author?: string
  /** Populated User object or plain ID string (new user posts). */
  authorId?: string | UserProfile
  publishedAt?: string
  featured: boolean
  seoTitle?: string
  seoDescription?: string
  status: PostStatus
  readingTime?: number
  postType: PostType
  /** True after new-post notification emails have been dispatched. */
  notificationSent: boolean
  createdAt: string
  updatedAt: string
}

export type DbPostSummary = Omit<DbPost, 'contentRaw' | 'contentHtml'>

// ─── UI / display types ──────────────────────────────────────────────────────

export interface MockPost {
  id: string
  title: string
  subtitle?: string
  slug: string
  excerpt: string
  category: string      // Display label e.g. "Stories"
  categorySlug: string  // URL segment e.g. "stories"
  author: {
    name: string
    role: string
    initials: string
    username?: string   // for linking to /author/[username]
    avatar?: string
  }
  publishedAt: string
  readingTime: number
  featured: boolean
  postType: PostType
  coverGradient?: string
  coverImageUrl?: string
}

// ─── Adapter ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<PostCategory, string> = {
  stories:  'Stories',
  tech:     'Tech',
  insights: 'Insights',
}

const COVER_GRADIENTS: Record<PostCategory, string> = {
  stories:  'from-[#d3e056] to-[#a8b040]',
  tech:     'from-[#1a2d4a] to-[#0d1a2e]',
  insights: 'from-[#f0d9c2] to-[#c9a878]',
}

export function dbPostToMockPost(post: DbPost | DbPostSummary): MockPost {
  // Resolve author from populated User, legacy string, or fallback
  let authorName     = 'Editorial Team'
  let authorUsername: string | undefined
  let authorAvatar:   string | undefined

  if (post.authorId && typeof post.authorId === 'object') {
    const user = post.authorId as UserProfile
    authorName     = user.name
    authorUsername = user.username
    authorAvatar   = user.avatar
  } else if (post.author) {
    authorName = post.author
  }

  const initials = authorName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return {
    id:           post._id,
    title:        post.title,
    subtitle:     post.subtitle,
    slug:         post.slug,
    excerpt:      post.excerpt ?? '',
    category:     CATEGORY_LABELS[post.category] ?? post.category,
    categorySlug: post.category,
    author: {
      name:     authorName,
      role:     'Writer',
      initials,
      username: authorUsername,
      avatar:   authorAvatar,
    },
    publishedAt:   post.publishedAt ?? post.createdAt,
    readingTime:   post.readingTime ?? 5,
    featured:      post.featured,
    postType:      post.postType,
    coverGradient: COVER_GRADIENTS[post.category],
    coverImageUrl: post.coverImage,
  }
}
