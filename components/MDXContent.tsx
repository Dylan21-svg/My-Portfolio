'use client'

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'

export default function MDXContent({ source }: { source: MDXRemoteSerializeResult }) {
  return (
    <article className="prose prose-invert prose-teal max-w-none">
      <MDXRemote {...source} />
    </article>
  )
}
