import type { Metadata } from 'next';
import { getAppUrl } from '@/lib/app-url';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Mechi — Your gamer identity', template: '%s · Mechi' },
  description: 'One profile for everything you play.',
  metadataBase: new URL(getAppUrl()),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
