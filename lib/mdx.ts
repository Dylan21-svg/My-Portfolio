import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'

const POSTS_PATH = path.join(process.cwd(), 'content/blog')

export async function getPostSlugs() {
  if (!fs.existsSync(POSTS_PATH)) return []
  return fs.readdirSync(POSTS_PATH)
}

export async function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.mdx$/, '')
  const fullPath = path.join(POSTS_PATH, `${realSlug}.mdx`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  
  const mdxSource = await serialize(content)

  return {
    slug: realSlug,
    frontmatter: data,
    content: mdxSource,
  }
}

export async function getAllPosts() {
  const slugs = await getPostSlugs()
  const posts = await Promise.all(
    slugs.map((slug) => getPostBySlug(slug))
  )

  return posts.sort((a, b) => {
    if (a.frontmatter.date > b.frontmatter.date) return -1
    if (a.frontmatter.date < b.frontmatter.date) return 1
    return 0
  })
}
