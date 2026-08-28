import type { Metadata } from 'next';
import './globals.css';

const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
const metadataBaseUrl =
  configuredAppUrl ||
  (vercelProductionUrl ? `https://${vercelProductionUrl}` : 'http://localhost:3000');

export const metadata: Metadata = {
  title: { default: 'Mechi — Your gamer identity', template: '%s · Mechi' },
  description: 'One profile for everything you play.',
  metadataBase: new URL(metadataBaseUrl),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
