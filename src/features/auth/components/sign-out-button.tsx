'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton() {
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign('/');
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white/60 transition hover:border-white/20 hover:text-white disabled:opacity-50"
    >
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
