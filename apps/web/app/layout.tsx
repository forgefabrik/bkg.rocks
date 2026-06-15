import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css';

const geist = Geist({ subsets: ['latin'] });
const geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BKG',
  description: 'BKG Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
