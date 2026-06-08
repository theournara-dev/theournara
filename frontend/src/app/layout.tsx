import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import StoreLayout from '@/components/StoreLayout';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'our nara | Conscious Beauty & Skincare',
  description: 'Discover our nara – thoughtfully crafted skincare and beauty essentials for your skin.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased flex flex-col',
          inter.variable
        )}
      >
        <StoreLayout>{children}</StoreLayout>
      </body>
    </html>
  );
}
