import Link from 'next/link';
import { MechiMark } from '@/components/brand/mechi-mark';

const links = [
  { href: '/home', label: 'Home' },
  { href: '/discover', label: 'Discover' },
  { href: '/me', label: 'Me' },
];

export function AppNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07090de6] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/"><MechiMark /></Link>
        <nav className="flex items-center gap-1" aria-label="Primary navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/5 hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
