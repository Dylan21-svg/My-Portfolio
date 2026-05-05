import { getAllPosts } from '@/lib/mdx'
import Link from 'next/link'

export const metadata = {
  title: 'Blog | Dylan Sparks',
  description: 'Articles on software engineering, AI, and web development.',
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="container mx-auto px-4 py-20 min-h-screen">
      <h1 className="text-5xl font-bold text-primary mb-12 font-display">Blog</h1>
      
      <div className="grid gap-8">
        {posts.map((post) => (
          <Link 
            key={post.slug} 
            href={`/blog/${post.slug}`}
            className="glassmorphism rounded-2xl p-8 hover:shadow-teal-glow transition-all duration-300 group"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-primary font-semibold mb-2">{post.frontmatter.date}</p>
                <h2 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {post.frontmatter.title}
                </h2>
                <p className="text-text-gray mb-4">{post.frontmatter.description}</p>
                <div className="flex gap-2">
                  {post.frontmatter.tags.map((tag: string) => (
                    <span key={tag} className="text-xs bg-background-light/50 px-2 py-1 rounded border border-primary/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-primary font-bold">Read More →</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
