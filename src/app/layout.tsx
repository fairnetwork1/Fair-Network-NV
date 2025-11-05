
'use client';

import { Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { AppShell } from '@/components/app-shell';
import { usePathname } from 'next/navigation';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/';

  return (
    <html lang="en">
      <head>
        <title>Fair Chain</title>
        <meta name="description" content="Fair Chain - The future of decentralized applications." />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo512.png"></link>
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/logo512.png" type="image/png" sizes="any" />
      </head>
      <body className={`${poppins.className} antialiased`}>
        <FirebaseClientProvider>
          {isAuthPage ? children : <AppShell>{children}</AppShell>}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
