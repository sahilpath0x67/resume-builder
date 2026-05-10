import type { Metadata, Viewport } from 'next';
import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'AnantaCV — Free Professional Resume Builder',
  description: 'Build a polished, ATS-friendly resume in minutes. Choose from 7 templates, use AI to write your bullets, generate cover letters, and score your resume against any job. Free to use.',
  keywords: ['resume builder', 'CV builder', 'free resume', 'ATS resume', 'cover letter generator', 'resume Nepal', 'AnantaCV'],
  authors: [{ name: 'AnantaCV' }],
  creator: 'AnantaCV',
  openGraph: {
    title: 'AnantaCV — Free Professional Resume Builder',
    description: 'Build a polished, ATS-friendly resume in minutes. 7 templates, AI writing, cover letter generator.',
    url: 'https://anantacv.vercel.app',
    siteName: 'AnantaCV',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AnantaCV — Free Professional Resume Builder',
    description: 'Build a polished, ATS-friendly resume in minutes. Free to use.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#1D9E75',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}