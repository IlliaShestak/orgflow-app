import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Geist } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="uk" className={cn("h-full", plusJakartaSans.variable, "font-sans", geist.variable)}>
      <body className="font-sans antialiased min-h-full bg-[#F7F8FA]">
        {children}
      </body>
    </html>
  )
}
