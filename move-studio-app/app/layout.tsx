'use client';

import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { Inter } from 'next/font/google'

import { WalletProvider } from "@suiet/wallet-kit";
import { Toaster } from "@/components/ui/sonner"
import { Analytics } from '@vercel/analytics/react';
import BuildProvider from '@/Contexts/BuildProvider';
import { CSPostHogProvider } from '@/Contexts/PosthogProvider';


const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CSPostHogProvider>
          <WalletProvider>
            <ThemeProvider attribute="class" defaultTheme="dark">
              <BuildProvider>
                {children}
                <Analytics />
                <Toaster richColors closeButton/>
              </BuildProvider>
            </ThemeProvider>
          </WalletProvider>
        </CSPostHogProvider>
      </body>
    </html>
  )
}
