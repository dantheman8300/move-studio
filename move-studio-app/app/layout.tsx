'use client';

import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { Inter } from 'next/font/google'

import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { Toaster } from "@/components/ui/sonner"
import { Analytics } from '@vercel/analytics/react';
import BuildProvider from '@/Contexts/BuildProvider';
import { CSPostHogProvider } from '@/Contexts/PosthogProvider';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig({
	testnet: { url: getFullnodeUrl('testnet') },
	mainnet: { url: getFullnodeUrl('mainnet') },
  devnet: { url: getFullnodeUrl('devnet') },
});
const queryClient = new QueryClient();

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
          <QueryClientProvider client={queryClient}>
            <SuiClientProvider networks={networkConfig}>
              <WalletProvider
                stashedWallet={{
                  name: 'Move Studio IDE',
                }}
                autoConnect
              >
                <ThemeProvider attribute="class" defaultTheme="dark">
                  <BuildProvider>
                    {children}
                    <Analytics />
                    <Toaster richColors closeButton/>
                  </BuildProvider>
                </ThemeProvider>
              </WalletProvider>
            </SuiClientProvider>
          </QueryClientProvider>
        </CSPostHogProvider>
      </body>
    </html>
  )
}
