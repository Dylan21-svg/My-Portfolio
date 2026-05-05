import { getPostBySlug } from '@/lib/mdx'
import MDXContent from '@/components/MDXContent'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  return {
    title: `${post.frontmatter.title} | Dylan Sparks`,
    description: post.frontmatter.description,
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)

  return (
    <div className="container mx-auto px-4 py-20 min-h-screen">
      <Link 
        href="/blog" 
        className="inline-flex items-center text-primary hover:underline mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Blog
      </Link>

      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <p className="text-primary font-semibold mb-2">{post.frontmatter.date}</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-display">
            {post.frontmatter.title}
          </h1>
          <div className="flex items-center gap-4 text-text-gray">
            <span>By {post.frontmatter.author}</span>
            <span>•</span>
            <div className="flex gap-2">
              {post.frontmatter.tags.map((tag: string) => (
                <span key={tag} className="text-xs bg-background-light/50 px-2 py-1 rounded border border-primary/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className="glassmorphism rounded-2xl p-8 md:p-12">
          <MDXContent source={post.content} />
        </div>
      </div>
    </div>
  )
}
