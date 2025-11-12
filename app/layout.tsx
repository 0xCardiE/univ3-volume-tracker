import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Uniswap V3 Token Volumes',
  description: 'Track daily trading volumes for Uniswap V3 pairs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

