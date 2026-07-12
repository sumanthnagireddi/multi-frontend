import { Space_Grotesk } from 'next/font/google';
import './global.css';
import { ThemeSync } from './theme-sync';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
});

export const metadata = {
  title: 'Unified Frontend Monorepo | Next app',
  description:
    'Next.js app sharing libraries with Angular and React inside one Nx workspace.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} min-h-screen bg-[color:var(--canvas)] text-[color:var(--ink)] antialiased`}
      >
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
