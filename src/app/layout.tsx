import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Resume Builder — Free Professional Resumes in Seconds',
  description: 'Build a polished, ATS-friendly resume instantly using AI. Add experience, skills, and let AI write your bullets and summary.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
