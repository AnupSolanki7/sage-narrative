import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import FeaturedVisualCard from './FeaturedVisualCard'
import type { MockPost } from '@/types'

interface HeroSectionProps {
  featuredPost?: MockPost | null
}

export default function HeroSection({ featuredPost }: HeroSectionProps) {
  return (
    <section className="relative px-4 md:px-8 py-12 md:py-16 lg:py-20 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left: Editorial text content */}
        <div className="lg:col-span-7">
          {/* Label */}
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#5b6300] dark:text-[#c2cf47] bg-[#d3e056]/30 dark:bg-[#d3e056]/10 px-3 py-1.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              From idea to publish-ready
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight text-[#181d12] dark:text-[#f7fce9] mb-6">
            Turn your{' '}
            <span className="italic text-[#5b6300] dark:text-[#c2cf47]">ideas</span>{' '}
            <br className="hidden sm:block" />
            into publish-ready{' '}
            <span className="relative inline-block">
              <span className="relative z-10">stories</span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-[#d3e056] -z-0 rounded-sm" />
            </span>
            .
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-[#464841] dark:text-[#c6c7be] leading-relaxed mb-8 max-w-xl">
            Bring a thought, draft, or rough note. An AI-assisted writing workflow
            helps you shape it into a polished blog — with structure, clarity,
            SEO, and image suggestions — ready to publish in minutes.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard/posts/new"
              className="inline-flex items-center gap-2 rounded-full bg-[#5b6300] text-white font-semibold px-7 py-3 text-sm transition-all hover:bg-[#4a5100] hover:shadow-premium active:scale-95"
            >
              Start writing
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#464841] dark:text-[#c6c7be] hover:text-[#5b6300] dark:hover:text-[#c2cf47] transition-colors group"
            >
              Explore stories
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 mt-10 pt-10 border-t border-[#e0e5d2] dark:border-[#2d3226]">
            <div>
              <span className="block font-serif font-bold text-2xl text-[#181d12] dark:text-[#f7fce9]">
                Idea
              </span>
              <span className="text-xs text-[#767870] dark:text-[#464841] uppercase tracking-wider">
                Bring your spark
              </span>
            </div>
            <div className="w-px h-10 bg-[#e0e5d2] dark:bg-[#2d3226]" />
            <div>
              <span className="block font-serif font-bold text-2xl text-[#181d12] dark:text-[#f7fce9]">
                Draft
              </span>
              <span className="text-xs text-[#767870] dark:text-[#464841] uppercase tracking-wider">
                Shape with AI
              </span>
            </div>
            <div className="w-px h-10 bg-[#e0e5d2] dark:bg-[#2d3226]" />
            <div>
              <span className="block font-serif font-bold text-2xl text-[#181d12] dark:text-[#f7fce9]">
                Publish
              </span>
              <span className="text-xs text-[#767870] dark:text-[#464841] uppercase tracking-wider">
                Reach readers
              </span>
            </div>
          </div>
        </div>

        {/* Right: Featured visual card */}
        <div className="lg:col-span-5 order-last lg:order-none flex justify-center lg:justify-end">
          <div className="w-full max-w-[420px] lg:max-w-none">
            <FeaturedVisualCard post={featuredPost} />
          </div>
        </div>
      </div>
    </section>
  )
}
