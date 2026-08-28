import Link from 'next/link';
import { AuthForm } from '@/features/auth/components/auth-form';
import { MechiMark } from '@/components/brand/mechi-mark';

export default function SignupPage() {
  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-md">
        <Link href="/" aria-label="Mechi home"><MechiMark /></Link>
        <section className="mt-16 rounded-[2rem] border border-white/8 bg-[#0e1218] p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--accent)]">Mechi ID</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-.045em]">Start your gamer identity.</h1>
          <p className="mt-3 text-sm leading-6 text-white/50">Create your account first. Your unique @handle is claimed immediately after sign-in.</p>
          <AuthForm mode="signup" />
        </section>
      </div>
    </main>
  );
}
