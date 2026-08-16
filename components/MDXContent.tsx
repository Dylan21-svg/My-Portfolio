import { MDXRemote } from 'next-mdx-remote/rsc'

export default function MDXContent({ source }: { source: string }) {
  return (
    <article className="prose prose-invert prose-teal max-w-none">
      <MDXRemote source={source} />
    </article>
  )
}

