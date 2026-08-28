import { AppNav } from '@/components/layout/app-nav';

export default function ProductLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
    </div>
  );
}
