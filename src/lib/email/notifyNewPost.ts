import { connectDB } from '@/lib/db/mongodb'
import Post from '@/models/Post'
import Subscriber from '@/models/Subscriber'
import { sendNewPostNotification } from './sender'
import type { DbPost, UserProfile } from '@/types'

/**
 * Dispatch the new-post notification email for a freshly published post.
 *
 * Safe to call from any publish code path (admin create, admin publish toggle,
 * user create, user publish toggle, user edit form): author resolution and
 * duplicate protection are handled here.
 *
 *   - Only sends if `post.status === 'published'` AND `notificationSent` is
 *     still false. Caller may optionally pass `force: true` to bypass the
 *     notificationSent check (not used by the standard flow).
 *   - Sets `notificationSent = true` and `notificationSentAt = new Date()`
 *     regardless of per-email delivery success, so retries or re-publishes
 *     cannot spam subscribers.
 *   - Never throws — errors are logged. The caller's publish/create flow
 *     continues normally even if email transport is down.
 */
export async function notifyNewPostIfNeeded(
  post: DbPost,
  opts: { force?: boolean } = {}
): Promise<void> {
  if (post.status !== 'published') return
  if (post.notificationSent && !opts.force) return

  try {
    // Resolve author name from populated User, legacy string, or fallback
    let authorName: string | undefined
    if (post.authorId && typeof post.authorId === 'object') {
      authorName = (post.authorId as UserProfile).name
    } else if (post.author) {
      authorName = post.author
    }

    await connectDB()
    const subscribers = await Subscriber.find({ status: 'active' }).select('email').lean()
    const recipients = (subscribers as { email: string }[]).map((s) => s.email)

    // Mark notificationSent BEFORE firing so a crash mid-send can't re-trigger.
    await Post.findByIdAndUpdate(post._id, {
      notificationSent:   true,
      notificationSentAt: new Date(),
    })

    // Fire-and-forget — transport failures are logged inside sender.ts.
    sendNewPostNotification({
      postId:      post._id,
      title:       post.title,
      slug:        post.slug,
      excerpt:     post.excerpt,
      authorName,
      coverImage:  post.coverImage,
      category:    post.category,
      readingTime: post.readingTime,
      recipients,
    }).catch((err) => {
      console.error('[notifyNewPost] send error:', err)
    })
  } catch (err) {
    console.error('[notifyNewPost] unexpected error:', err)
  }
}
