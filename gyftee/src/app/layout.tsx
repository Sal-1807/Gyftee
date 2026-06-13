import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Gyftee — Discover gifts you actually want',
  description: 'Swipe through curated gifts and build your wishlist. Share with friends who actually get you.',
  manifest: '/manifest.json',
  icons: { icon: '/icon-512.png', apple: '/icon-192.png' },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Gyftee',
  },
};

export const viewport: Viewport = {
  themeColor: '#2CC4A0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
