import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
})

export const metadata: Metadata = {
  title: 'OrgFlow',
  description: 'HR & Knowledge Management for BEST Lviv',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" className={`${plusJakartaSans.variable} h-full`}>
      <body className="font-sans antialiased min-h-full bg-[#F7F8FA]">
        {children}
      </body>
    </html>
  )
}
