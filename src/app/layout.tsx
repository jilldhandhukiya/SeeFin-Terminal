import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppStateProvider } from '@/state/appState';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CommandBar from '@/components/layout/CommandBar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'SeeTrade',
    template: '%s | SeeTrade',
  },
  description: 'Institutional-grade real-time market data, paper trading simulator, execution engine, and analytics terminal.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="h-full min-h-full bg-black text-gray-300 font-sans selection:bg-amber-500 selection:text-black flex flex-col overflow-hidden">
        <AppStateProvider>
          <div className="h-full flex flex-col overflow-hidden">
            <Header />
            <div className="flex-1 flex overflow-hidden">
              <Sidebar />
              <main className="flex-1 bg-black relative flex flex-col overflow-hidden min-w-0">
                <CommandBar />
                <div className="flex-1 overflow-y-auto overflow-x-auto custom-scrollbar min-h-0 bg-black p-1 md:p-1.5">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </AppStateProvider>
      </body>
    </html>
  );
}
