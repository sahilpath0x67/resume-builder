import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AnantaCV — Free Professional Resume Builder',
  description: 'Build a polished, ATS-friendly resume instantly. Choose from 7 templates, use AI to write your bullets, generate cover letters, and score your resume against any job.',
  keywords: [
    'resume builder',
    'AI resume',
    'ATS resume',
    'cover letter generator',
    'free resume maker',
    'professional resume',
    'LinkedIn bio generator',
  ],
  authors: [{ name: 'AI Resume Builder' }],
  openGraph: {
    title: 'AI Resume Builder — Free Professional Resumes in Seconds',
    description:
      'Build a polished, ATS-friendly resume instantly using AI. Cover letters, ATS scoring, and LinkedIn bios included.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Resume Builder',
    description:
      'Build a polished, ATS-friendly resume instantly using AI.',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}