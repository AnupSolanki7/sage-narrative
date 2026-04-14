import matter from 'gray-matter'

// ---------------------------------------------------------------------------
// Defensive helpers (kept here so this module stays client-safe —
// no server-only remark/rehype imports)
// ---------------------------------------------------------------------------

/**
 * Remove a single outer Markdown code-fence wrapper when the entire file is
 * fenced.  Mirrors the same helper in parser.ts (server-side).
 * Internal fences inside the article body are left untouched.
 */
function unwrapOuterMarkdownFence(raw: string): string {
  const trimmed = raw.trimStart()
  const openMatch = trimmed.match(/^```(md|markdown)?\r?\n/)
  if (!openMatch) return raw
  const afterOpen = trimmed.slice(openMatch[0].length)
  const closeMatch = afterOpen.match(/\n```[ \t]*(\r?\n)?$/)
  if (!closeMatch) return raw
  const inner = afterOpen.slice(0, afterOpen.length - closeMatch[0].length)
  console.log('[markdown] Outer code-fence wrapper detected and removed (client).')
  return inner
}

function stripBOM(str: string): string {
  return str.charCodeAt(0) === 0xfeff ? str.slice(1) : str
}

/**
 * Regex-based frontmatter stripping used as a safety net when gray-matter
 * can't detect the opening delimiter (BOM, unusual encoding, etc.).
 */
function stripFrontmatterFallback(text: string): string {
  if (!text.startsWith('---')) return text
  const rest = text.slice(3)
  const closing = rest.search(/\r?\n---(\r?\n|$)/)
  if (closing === -1) return text
  return rest.slice(closing).replace(/^\r?\n---(\r?\n|$)/, '').trimStart()
}

export interface ParsedPostDraft {
  title: string
  subtitle: string
  slug: string
  excerpt: string
  category: 'stories' | 'tech' | 'insights'
  tags: string[]
  author: string
  featured: boolean
  coverImage: string
  seoTitle: string
  seoDescription: string
  publishedAt: string
  contentRaw: string
  validationErrors: string[]
}

// ---------------------------------------------------------------------------
// Normalisation helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeCategory(raw: string): 'stories' | 'tech' | 'insights' {
  const v = raw.toLowerCase().trim()
  if (v === 'story' || v === 'stories') return 'stories'
  if (v === 'tech' || v === 'technology') return 'tech'
  if (v === 'insight' || v === 'insights') return 'insights'
  return 'tech' // safe fallback
}

function postTypeToCategory(postType: string): 'stories' | 'tech' | 'insights' {
  const v = postType.toLowerCase().trim()
  if (v === 'story') return 'stories'
  if (v === 'tech') return 'tech'
  if (v === 'insight') return 'insights'
  return 'tech'
}

/** Extract the first H1 headline from the markdown body. */
function extractFirstH1(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m)
  return match ? match[1].replace(/\*{1,2}|_{1,2}|`/g, '').trim() : ''
}

/**
 * Extract the first non-empty, non-heading paragraph and trim it to a
 * reasonable summary length (≤ 300 chars, cut at a sentence boundary).
 */
function extractFirstParagraph(markdown: string): string {
  const lines = markdown.split('\n')
  const paraLines: string[] = []
  let collecting = false

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      if (collecting) break // blank line ends a paragraph
      continue
    }
    // Skip headings, block-level markers
    if (/^#{1,6}\s/.test(line)) continue
    if (/^(>|[-*+]|\d+\.)/.test(line)) continue
    if (/^```/.test(line)) break

    collecting = true
    paraLines.push(line)
  }

  if (!paraLines.length) return ''

  let text = paraLines.join(' ').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // strip links
  text = text.replace(/[*_`]/g, '').trim()

  if (text.length <= 300) return text

  // Try to cut at a sentence boundary
  const cutAt = text.lastIndexOf('. ', 300)
  return cutAt > 60 ? text.slice(0, cutAt + 1) : text.slice(0, 300).trimEnd() + '…'
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Parse a markdown file string entirely on the client.
 * Uses `gray-matter` for frontmatter; no remark/rehype (those run server-side
 * during save). Applies fallback inference for every missing field.
 */
export function parseMarkdownPost(fileText: string): ParsedPostDraft {
  // 1. Remove outer code-fence wrapper if the whole file is fenced
  const unwrapped = unwrapOuterMarkdownFence(fileText)

  // 2. Strip BOM so gray-matter detects the "---" delimiter correctly
  const clean = stripBOM(unwrapped)

  let data: Record<string, unknown> = {}
  let contentRaw = clean

  try {
    const parsed = matter(clean)
    data = parsed.data as Record<string, unknown>
    contentRaw = parsed.content
  } catch {
    // gray-matter failed (can happen in certain browser bundles) — fall through
    // to the regex safety net below
  }

  // Safety net: if matter didn't strip the frontmatter block, do it with regex
  // so the raw body sent to the server never contains YAML.
  contentRaw = stripFrontmatterFallback(contentRaw)

  const validationErrors: string[] = []

  // ── title ─────────────────────────────────────────────────────────────────
  let title = data.title ? String(data.title).trim() : ''
  if (!title) {
    title = extractFirstH1(contentRaw)
  }
  if (!title) validationErrors.push('Title is required — add a title to frontmatter or an H1 to the body.')

  // ── subtitle ──────────────────────────────────────────────────────────────
  const subtitle = data.subtitle ? String(data.subtitle).trim() : ''

  // ── slug ──────────────────────────────────────────────────────────────────
  let slug = data.slug ? String(data.slug).trim() : ''
  if (!slug && title) slug = slugify(title)
  if (!slug) validationErrors.push('Could not generate a slug — please fill in the Slug field manually.')

  // ── category ──────────────────────────────────────────────────────────────
  let category: 'stories' | 'tech' | 'insights' = 'tech'
  if (data.category) {
    category = normalizeCategory(String(data.category))
  } else if (data.postType) {
    category = postTypeToCategory(String(data.postType))
  }

  // ── excerpt ───────────────────────────────────────────────────────────────
  let excerpt = data.excerpt ? String(data.excerpt).trim() : ''
  if (!excerpt) excerpt = extractFirstParagraph(contentRaw)

  // ── tags ──────────────────────────────────────────────────────────────────
  let tags: string[] = []
  if (Array.isArray(data.tags)) {
    tags = (data.tags as unknown[]).map(String).filter(Boolean)
  } else if (typeof data.tags === 'string' && data.tags.trim()) {
    tags = data.tags.split(',').map((t) => t.trim()).filter(Boolean)
  }

  // ── author ────────────────────────────────────────────────────────────────
  const author = data.author ? String(data.author).trim() : ''

  // ── featured ─────────────────────────────────────────────────────────────
  const featured = Boolean(data.featured ?? false)

  // ── coverImage ────────────────────────────────────────────────────────────
  const coverImage = data.coverImage ? String(data.coverImage).trim() : ''

  // ── SEO ───────────────────────────────────────────────────────────────────
  const seoTitle = data.seoTitle ? String(data.seoTitle).trim() : title
  const seoDescription = data.seoDescription ? String(data.seoDescription).trim() : excerpt

  // ── publishedAt ───────────────────────────────────────────────────────────
  const publishedAt = data.publishedAt ? String(data.publishedAt).trim() : ''

  // ── body validation ───────────────────────────────────────────────────────
  if (!contentRaw.trim()) {
    validationErrors.push('Markdown body is empty.')
  }

  return {
    title,
    subtitle,
    slug,
    excerpt,
    category,
    tags,
    author,
    featured,
    coverImage,
    seoTitle,
    seoDescription,
    publishedAt,
    contentRaw,
    validationErrors,
  }
}
