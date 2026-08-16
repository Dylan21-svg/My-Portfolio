import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const POSTS_PATH = path.join(process.cwd(), 'content/blog')

export async function getPostSlugs() {
  if (!fs.existsSync(POSTS_PATH)) return []
  return fs.readdirSync(POSTS_PATH)
}

export async function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.mdx$/, '')
  const fullPath = path.join(POSTS_PATH, `${realSlug}.mdx`)
  if (!fs.existsSync(fullPath)) {
    return null
  }
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    slug: realSlug,
    frontmatter: data,
    content,
  }
}

export async function getAllPosts() {
  const slugs = await getPostSlugs()
  const postPromises = slugs
    .filter(s => s.endsWith('.mdx'))
    .map((slug) => getPostBySlug(slug))
  const posts = (await Promise.all(postPromises)).filter(Boolean) as Array<{
    slug: string
    frontmatter: any
    content: string
  }>

  return posts.sort((a, b) => {
    if ((a.frontmatter?.date || '') > (b.frontmatter?.date || '')) return -1
    if ((a.frontmatter?.date || '') < (b.frontmatter?.date || '')) return 1
    return 0
  })
}

