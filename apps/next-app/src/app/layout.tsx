import { Space_Grotesk } from 'next/font/google';
import './global.css';
import { ThemeSync } from './theme-sync';
import { ToastProvider } from './components/ToastProvider';
import { AuthProvider } from './components/AuthProvider';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
});

export const metadata = {
  title: 'Private Finance Ledger',
  description: 'Private finance ledger dashboard for expenses, construction, cards and debts.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Finance Ledger',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0b0f19" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Finance Ledger" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
              navigator.serviceWorker.register('/sw.js').then(
                function(reg) { console.log('SW registered:', reg.scope); },
                function(err) { console.log('SW registration failed:', err); }
              );
            });
          }
        ` }} />
      </head>
      <body
        className={`${spaceGrotesk.variable} min-h-screen bg-[color:var(--canvas)] text-[color:var(--ink)] antialiased`}
      >
        <ThemeSync />
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
