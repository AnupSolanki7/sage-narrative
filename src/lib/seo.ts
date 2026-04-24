import type { Metadata } from 'next'
import type { DbPost, DbPostSummary, PostCategory, UserProfile } from '@/types'

// ---------------------------------------------------------------------------
// Environment / constants
// ---------------------------------------------------------------------------

/** Strip trailing slashes so joined paths never double-slash. */
function stripTrailingSlash(u: string): string {
  return u.replace(/\/+$/, '')
}

export const SITE_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
)

export const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME ?? 'Sage Narrative'

export const SITE_DESCRIPTION =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
  'A premium editorial publication at the intersection of technology, human experience, and deeper insights. Long-form essays for the thoughtful reader.'

export const DEFAULT_OG_IMAGE =
  process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE ?? '/og-default.png'

export const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE // optional, e.g. "@sagenarrative"

const CATEGORY_LABELS: Record<PostCategory, string> = {
  stories:  'Stories',
  tech:     'Tech',
  insights: 'Insights',
}

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

/** Resolve any path or URL to an absolute site URL. No double slashes. */
export function getAbsoluteUrl(path: string | undefined | null): string {
  if (!path) return SITE_URL
  if (/^https?:\/\//i.test(path)) return path
  const p = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${p}`
}

/** Canonical URL for a given in-site path. */
export function canonicalUrl(path: string): string {
  return getAbsoluteUrl(path)
}

// ---------------------------------------------------------------------------
// Metadata helpers
// ---------------------------------------------------------------------------

export interface DefaultSeoOptions {
  title?: string
  description?: string
  /** In-site path, e.g. "/blog" — becomes canonical + og:url */
  path?: string
  /** Image URL or path — absolutized automatically. */
  image?: string | null
  type?: 'website' | 'article' | 'profile'
  /** For articles. */
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  tags?: string[]
}

/**
 * Build a Metadata object that merges cleanly with the root layout defaults.
 * Always sets canonical, OG URL, OG image, and Twitter card.
 */
export function getDefaultSeo(opts: DefaultSeoOptions = {}): Metadata {
  const title = opts.title ?? SITE_NAME
  const description = opts.description ?? SITE_DESCRIPTION
  const url = opts.path ? canonicalUrl(opts.path) : SITE_URL
  const image = getAbsoluteUrl(opts.image || DEFAULT_OG_IMAGE)

  const openGraph: Metadata['openGraph'] = {
    type: opts.type === 'article' ? 'article' : opts.type === 'profile' ? 'profile' : 'website',
    url,
    siteName: SITE_NAME,
    title,
    description,
    locale: 'en_US',
    images: [{ url: image, alt: title }],
  }

  if (opts.type === 'article') {
    (openGraph as { publishedTime?: string }).publishedTime = opts.publishedTime
    ;(openGraph as { modifiedTime?: string }).modifiedTime = opts.modifiedTime
    ;(openGraph as { authors?: string[] }).authors = opts.authors
    ;(openGraph as { tags?: string[] }).tags = opts.tags
  }

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      ...(TWITTER_HANDLE ? { site: TWITTER_HANDLE, creator: TWITTER_HANDLE } : {}),
    },
  }
}

/** Reusable metadata block for private/auth pages. */
export const NOINDEX_METADATA: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, 'max-image-preview': 'none' },
  },
}

// ---------------------------------------------------------------------------
// JSON-LD builders
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  name: string
  /** In-site path or absolute URL. */
  path: string
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: getAbsoluteUrl(it.path),
    })),
  }
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: getAbsoluteUrl('/logo.svg'),
    },
    sameAs: [] as string[],
  }
}

export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { '@id': `${SITE_URL}#organization` },
    inLanguage: 'en-US',
  }
}

export interface ArticleJsonLdInput {
  post: DbPost
  authorName: string
  authorUrl?: string
  authorImage?: string
}

/** Build BlogPosting + Article-compatible JSON-LD for a blog post. */
export function buildArticleJsonLd({
  post,
  authorName,
  authorUrl,
  authorImage,
}: ArticleJsonLdInput) {
  const url = canonicalUrl(`/blog/${post.slug}`)
  const image = post.coverImage
    ? getAbsoluteUrl(post.coverImage)
    : getAbsoluteUrl(DEFAULT_OG_IMAGE)

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seoTitle || post.title,
    alternativeHeadline: post.subtitle || undefined,
    description: post.seoDescription || post.excerpt || undefined,
    image: [image],
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt ?? post.publishedAt ?? post.createdAt,
    author: {
      '@type': 'Person',
      name: authorName,
      url: authorUrl,
      image: authorImage ? getAbsoluteUrl(authorImage) : undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: getAbsoluteUrl('/logo.svg'),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url,
    keywords: post.tags?.length ? post.tags.join(', ') : undefined,
    articleSection: CATEGORY_LABELS[post.category] ?? post.category,
    wordCount: post.contentRaw
      ? post.contentRaw.trim().split(/\s+/).filter(Boolean).length
      : undefined,
    inLanguage: 'en-US',
  }
}

/** Build Person JSON-LD for an author. */
export function buildAuthorJsonLd(user: UserProfile) {
  const url = canonicalUrl(`/author/${user.username}`)
  const sameAs: string[] = []
  const s = user.socialLinks ?? {}
  if (s.twitter) sameAs.push(s.twitter)
  if (s.github) sameAs.push(s.github)
  if (s.linkedin) sameAs.push(s.linkedin)
  if (s.website) sameAs.push(s.website)

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${url}#person`,
    name: user.name,
    url,
    image: user.avatar ? getAbsoluteUrl(user.avatar) : undefined,
    description: user.bio || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  }
}

/** Build ProfilePage JSON-LD wrapping a Person. */
export function buildProfilePageJsonLd(user: UserProfile, postCount: number) {
  const url = canonicalUrl(`/author/${user.username}`)
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': url,
    url,
    name: `${user.name} — ${SITE_NAME}`,
    description: user.bio || `Read posts by ${user.name} on ${SITE_NAME}.`,
    mainEntity: { '@id': `${url}#person` },
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/WriteAction',
      userInteractionCount: postCount,
    },
  }
}

/** Build CollectionPage JSON-LD with an ItemList of posts. */
export function buildCollectionJsonLd(params: {
  path: string
  name: string
  description: string
  posts: DbPostSummary[]
}) {
  const url = canonicalUrl(params.path)
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': url,
    url,
    name: params.name,
    description: params.description,
    inLanguage: 'en-US',
    isPartOf: { '@id': `${SITE_URL}#website` },
    hasPart: params.posts.slice(0, 20).map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: canonicalUrl(`/blog/${p.slug}`),
      datePublished: p.publishedAt ?? p.createdAt,
      image: p.coverImage ? getAbsoluteUrl(p.coverImage) : undefined,
    })),
  }
}
