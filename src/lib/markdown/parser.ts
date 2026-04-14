import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'

// ---------------------------------------------------------------------------
// Defensive helpers
// ---------------------------------------------------------------------------

/**
 * If the entire file is wrapped in a single outer Markdown code fence
 * (e.g. ```md … ```) remove that wrapper before any further processing.
 *
 * Only the outermost fence is removed.  Internal code fences (e.g. a
 * ```ts block inside the article body) are left completely intact.
 *
 * Matches opening fences:  ```md  ```markdown  ```
 * The closing fence must be the very last non-empty line of the document.
 */
export function unwrapOuterMarkdownFence(raw: string): string {
  const trimmed = raw.trimStart()

  // Opening fence: optional language tag limited to safe identifiers
  const openMatch = trimmed.match(/^```(md|markdown)?\r?\n/)
  if (!openMatch) return raw

  const afterOpen = trimmed.slice(openMatch[0].length)

  // The closing ``` must be the final non-empty content
  const closeMatch = afterOpen.match(/\n```[ \t]*(\r?\n)?$/)
  if (!closeMatch) return raw

  const inner = afterOpen.slice(0, afterOpen.length - closeMatch[0].length)

  console.log('[markdown] Outer code-fence wrapper detected and removed.')
  return inner
}

/** Strip a UTF-8 BOM if present — gray-matter won't detect frontmatter without this. */
function stripBOM(str: string): string {
  return str.charCodeAt(0) === 0xfeff ? str.slice(1) : str
}

/**
 * Regex-based frontmatter stripper used as a safety net.
 * If gray-matter fails to detect frontmatter (e.g. after a BOM that slipped
 * through, or an unusual line-ending), remark would render the YAML block as
 * paragraph text.  This removes it before remark ever sees the content.
 */
function stripFrontmatterIfPresent(content: string): string {
  // Frontmatter must start at position 0 with exactly "---"
  if (!content.startsWith('---')) return content
  const rest = content.slice(3)
  // Find the closing delimiter on its own line
  const closing = rest.search(/\r?\n---(\r?\n|$)/)
  if (closing === -1) return content // no closing delimiter → not valid frontmatter
  const afterClosing = rest.slice(closing).replace(/^\r?\n---(\r?\n|$)/, '')
  return afterClosing.trimStart() // drop leading blank lines
}

export interface ParsedFrontmatter {
  title: string
  subtitle?: string
  excerpt?: string
  slug?: string
  category?: string
  tags?: string[]
  coverImage?: string
  publishedAt?: string
  featured?: boolean
  seoTitle?: string
  seoDescription?: string
  author?: string
  postType?: string
}

export interface ParsedMarkdown {
  frontmatter: ParsedFrontmatter
  contentHtml: string
  contentRaw: string
  readingTime: number
  errors: string[]
}

function estimateReadingTime(text: string): number {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

function validateFrontmatter(data: Record<string, unknown>): {
  parsed: ParsedFrontmatter
  errors: string[]
} {
  const errors: string[] = []

  if (!data.title || typeof data.title !== 'string') {
    errors.push('Missing required field: title')
  }

  if (data.category) {
    const validCategories = ['stories', 'tech', 'insights']
    const cat = String(data.category).toLowerCase()
    if (!validCategories.includes(cat)) {
      errors.push(`Invalid category "${data.category}". Must be one of: stories, tech, insights`)
    }
  }

  if (data.postType) {
    const validTypes = ['story', 'tech', 'insight']
    if (!validTypes.includes(String(data.postType))) {
      errors.push(`Invalid postType "${data.postType}". Must be one of: story, tech, insight`)
    }
  }

  const parsed: ParsedFrontmatter = {
    title: String(data.title ?? ''),
    subtitle: data.subtitle ? String(data.subtitle) : undefined,
    excerpt: data.excerpt ? String(data.excerpt) : undefined,
    slug: data.slug ? String(data.slug).toLowerCase().replace(/\s+/g, '-') : undefined,
    category: data.category ? String(data.category).toLowerCase() : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    coverImage: data.coverImage ? String(data.coverImage) : undefined,
    publishedAt: data.publishedAt ? String(data.publishedAt) : undefined,
    featured: Boolean(data.featured ?? false),
    seoTitle: data.seoTitle ? String(data.seoTitle) : undefined,
    seoDescription: data.seoDescription ? String(data.seoDescription) : undefined,
    author: data.author ? String(data.author) : undefined,
    postType: data.postType ? String(data.postType) : undefined,
  }

  return { parsed, errors }
}

// Infer postType from category if not provided
function inferPostType(
  postType: string | undefined,
  category: string | undefined
): 'story' | 'tech' | 'insight' {
  if (postType === 'story' || postType === 'tech' || postType === 'insight') return postType
  if (category === 'stories') return 'story'
  if (category === 'tech') return 'tech'
  if (category === 'insights') return 'insight'
  return 'insight'
}

export async function parseMarkdownFile(fileContent: string): Promise<ParsedMarkdown> {
  // 1. Remove outer code-fence wrapper if the whole file is fenced (e.g. ```md … ```)
  const unwrapped = unwrapOuterMarkdownFence(fileContent)

  // 2. Remove BOM so gray-matter can detect the leading "---"
  const clean = stripBOM(unwrapped)

  const { data, content: rawContent } = matter(clean)
  const { parsed, errors } = validateFrontmatter(data)

  // 2. Safety net: if matter didn't strip the frontmatter block (e.g. an
  //    unusual encoding or edge-case) strip it with the regex helper so that
  //    remark never sees raw YAML.
  const safeContent = stripFrontmatterIfPresent(rawContent)

  // Process markdown → HTML
  const processedFile = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeHighlight, { detect: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(safeContent)

  const contentHtml = String(processedFile)

  return {
    frontmatter: {
      ...parsed,
      postType: inferPostType(parsed.postType, parsed.category),
    },
    contentHtml,
    contentRaw: safeContent, // always the body-only, frontmatter stripped
    readingTime: estimateReadingTime(safeContent),
    errors,
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateSlugFromTitle(title: string): string {
  return slugify(title)
}
