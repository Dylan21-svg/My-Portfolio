import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-background-dark py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Top Section */}
          <div className="text-center md:text-left">
            <p className="text-text-gray mb-2">www.dylansparks.com</p>
          </div>

          {/* Middle Section */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-primary mb-4">Dylan Sparks</h3>
            <div className="flex justify-center space-x-6">
              <Link href="/" className="text-text-gray hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-text-gray hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/works" className="text-text-gray hover:text-primary transition-colors">
                Works
              </Link>
              <Link href="/contact" className="text-text-gray hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="text-center md:text-right">
            <p className="text-text-gray">
              © All rights reserved by Dylan Sparks
            </p>
            <p className="text-sm text-text-gray mt-2">
              Built with{' '}
              <a
                href="https://nextjs.org"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Next.js
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}