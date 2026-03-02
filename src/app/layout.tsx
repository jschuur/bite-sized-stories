import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { Navbar } from '@/components/Nav/Navbar';
import { QueryProvider } from '@/components/QueryProvider';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Bite Sized Stories',
  description: 'Practice a new language with random short stories',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-linear-to-b flex flex-col`}
      >
        <QueryProvider>
          <Navbar />
          <main className='flex-1'>{children}</main>
          <footer className='mt-auto py-6 px-4 text-center text-sm text-muted-foreground'>
            Work in progress, by{' '}
            <a
              href='https://bsky.app/profile/joostschuur.com'
              target='_blank'
              rel='noopener noreferrer'
              className='underline hover:text-foreground transition-colors'
            >
              Joost
            </a>{' '}
            ❤️ 🐸
          </footer>
        </QueryProvider>
      </body>
    </html>
  );
}
