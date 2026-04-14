import { notFound } from 'next/navigation'
import { getPostByIdAdmin } from '@/lib/db/posts'
import EditPostForm from '@/components/admin/EditPostForm'

interface Props {
  params: { id: string }
}

export default async function EditPostPage({ params }: Props) {
  let post = null

  try {
    post = await getPostByIdAdmin(params.id)
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

      <EditPostForm post={post} />
    </div>
  )
}
