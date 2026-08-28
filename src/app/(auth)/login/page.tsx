import Link from 'next/link';
import { AuthForm } from '@/features/auth/components/auth-form';
import { MechiMark } from '@/components/brand/mechi-mark';

export default function LoginPage() {
  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-md">
        <Link href="/" aria-label="Mechi home"><MechiMark /></Link>
        <section className="mt-20 rounded-[2rem] border border-white/8 bg-[#0e1218] p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--accent)]">Welcome back</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-.045em]">Log in to Mechi.</h1>
          <p className="mt-3 text-sm leading-6 text-white/50">Your gamer identity, games and profile live here.</p>
          <AuthForm mode="login" />
        </section>
      </div>
    </main>
  );
}
