import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GuardRail AI - Autonomous Security Remediation',
  description: 'Real-time vulnerability detection and automated secure code generation powered by Amazon Bedrock',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
