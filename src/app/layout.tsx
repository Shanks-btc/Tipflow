import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tip any streamer Instantly.',
  description:
    'Fans tip live streamers using only their email. No wallet. No MetaMask. No gas. No seed phrases.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans bg-bg text-[#F0EFE8] antialiased">
        {children}
      </body>
    </html>
  )
}
