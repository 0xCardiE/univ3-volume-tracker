import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Uniswap V3 Volume Tracker',
  description: 'Track daily trading volumes and fees for Uniswap V3 pairs with real-time contract data',
  keywords: ['Uniswap', 'V3', 'DeFi', 'Trading Volume', 'Ethereum', 'Analytics'],
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

