'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type AuthMode = 'login' | 'signup';

export function AuthForm({ mode }: { mode: AuthMode }) {
  const isSignup = mode === 'signup';
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    const supabase = createClient();

    if (isSignup) {
      const cleanName = displayName.trim();
      if (!cleanName) {
        setMessage('Add the name you want shown on your Mechi profile.');
        setBusy(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
          data: {
            app: 'mechi',
            full_name: cleanName,
          },
        },
      });

      if (error) {
        setMessage(error.message);
        setBusy(false);
        return;
      }

      if (data.session) {
        window.location.assign('/onboarding');
        return;
      }

      setMessage('Check your email to confirm your account, then come back to claim your Mechi ID.');
      setBusy(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage(error.message);
      setBusy(false);
      return;
    }

    window.location.assign('/onboarding');
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      {isSignup ? (
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[.16em] text-white/45">Display name</span>
          <input
            required
            maxLength={60}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            autoComplete="name"
            placeholder="Ryan"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3.5 outline-none transition focus:border-[var(--accent)]/60"
          />
        </label>
      ) : null}

      <label className="block">
        <span className="text-xs font-black uppercase tracking-[.16em] text-white/45">Email</span>
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3.5 outline-none transition focus:border-[var(--accent)]/60"
        />
      </label>

      <label className="block">
        <span className="text-xs font-black uppercase tracking-[.16em] text-white/45">Password</span>
        <input
          required
          minLength={8}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          placeholder="8+ characters"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3.5 outline-none transition focus:border-[var(--accent)]/60"
        />
      </label>

      {message ? (
        <p role="status" className="rounded-2xl border border-white/8 bg-white/[.035] px-4 py-3 text-sm leading-6 text-white/70">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-2xl bg-[var(--accent)] px-5 py-3.5 text-sm font-black text-[var(--accent-ink)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? 'Working…' : isSignup ? 'Create my Mechi' : 'Log in'}
      </button>

      <p className="text-center text-sm text-white/45">
        {isSignup ? 'Already have a Mechi?' : 'New to Mechi?'}{' '}
        <Link href={isSignup ? '/login' : '/signup'} className="font-bold text-white hover:text-[var(--accent)]">
          {isSignup ? 'Log in' : 'Create one'}
        </Link>
      </p>
    </form>
  );
}
