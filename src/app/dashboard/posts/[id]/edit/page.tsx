import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getUserPostById } from '@/lib/db/posts'
import EditUserPostForm from '@/components/dashboard/EditUserPostForm'

interface Props {
  params: { id: string }
}

export default async function DashboardEditPostPage({ params }: Props) {
  const session = await getSession()

  let post = null

  try {
    post = await getUserPostById(params.id, session.userId!)
  } catch {}

  if (!post) notFound()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif font-bold text-3xl text-[#181d12] dark:text-[#f7fce9]">
          Edit Post
        </h1>
        <p className="text-sm text-[#767870] dark:text-[#464841] mt-1 font-mono">
          /{post.slug}
        </p>
      </div>

      <EditUserPostForm post={post} />
    </div>
  )
}
