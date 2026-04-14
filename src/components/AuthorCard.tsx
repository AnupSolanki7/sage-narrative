import Link from 'next/link'
import { Twitter, Linkedin, Github, Globe, ExternalLink } from 'lucide-react'

interface AuthorCardProps {
  authorName?: string
  authorBio?: string
  authorRole?: string
  authorAvatar?: string
  authorUsername?: string
  socialLinks?: { platform: string; url: string }[]
  className?: string
}

const socialIcons: Record<string, React.ElementType> = {
  twitter: Twitter,
  linkedin: Linkedin,
  github: Github,
  website: Globe,
  substack: ExternalLink,
  instagram: ExternalLink,
}

export default function AuthorCard({
  authorName,
  authorBio,
  authorRole,
  authorAvatar,
  authorUsername,
  socialLinks = [],
  className,
}: AuthorCardProps) {
  const name = authorName ?? 'Author'
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const bio  = authorBio  ?? 'A writer at Sage Narrative, exploring the intersections of technology, culture, and the human experience.'
  const role = authorRole ?? 'Contributing Writer'

  const avatarEl = authorAvatar ? (
    <img
      src={authorAvatar}
      alt={name}
      className="w-20 h-20 rounded-full object-cover"
    />
  ) : (
    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5b6300] to-[#3d4500] flex items-center justify-center text-white font-bold text-2xl font-serif">
      {initials}
    </div>
  )

  return (
    <div className={`bg-white dark:bg-[#1c2217] rounded-[2rem] border border-[#e0e5d2] dark:border-[#2d3226] p-8 md:p-10 ${className ?? ''}`}>
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Avatar */}
        <div className="shrink-0">
          {authorUsername ? (
            <Link href={`/author/${authorUsername}`}>{avatarEl}</Link>
          ) : avatarEl}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              {authorUsername ? (
                <Link
                  href={`/author/${authorUsername}`}
                  className="font-serif font-bold text-xl text-[#181d12] dark:text-[#f7fce9] hover:text-[#5b6300] dark:hover:text-[#c2cf47] transition-colors"
                >
                  {name}
                </Link>
              ) : (
                <h3 className="font-serif font-bold text-xl text-[#181d12] dark:text-[#f7fce9]">
                  {name}
                </h3>
              )}
              <p className="text-xs font-semibold uppercase tracking-widest text-[#767870] dark:text-[#464841] mt-0.5">
                {role}
              </p>
            </div>

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-2">
                {socialLinks.map(({ platform, url }) => {
                  const Icon = socialIcons[platform.toLowerCase()] ?? Globe
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={platform}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-[#ebf0dd] dark:bg-[#2d3226] text-[#5b6300] dark:text-[#c2cf47] hover:bg-[#d3e056] dark:hover:bg-[#3d4530] transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          <p className="text-[#464841] dark:text-[#c6c7be] text-sm md:text-base leading-relaxed">
            {bio}
          </p>
        </div>
      </div>
    </div>
  )
}
