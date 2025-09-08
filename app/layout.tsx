import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/app/components/Navbar';
import { Toaster } from '@/components/ui/sonner';
import NextAuthProvider from '@/app/components/providers/NextAuthProvider';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Astrape store - Premium E-commerce',
  description: 'Discover premium products with exceptional quality and modern design.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <div className="min-h-screen bg-white">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t bg-gray-50">
              <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="text-center">
                  <p className="text-gray-600">
                    2025 Astrape store
                  </p>
                  <p className="text-gray-600">
                    All rights reserved to made by Yuvraj with love ❤️
                  </p>
                </div>
              </div>
            </footer>
          </div>
          <Toaster position="top-right" />
        </NextAuthProvider>
      </body>
    </html>
  );
}