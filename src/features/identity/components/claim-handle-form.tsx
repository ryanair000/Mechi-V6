'use client';

import { useActionState } from 'react';
import { claimHandle, type ClaimHandleState } from '@/features/identity/actions';

const initialState: ClaimHandleState = {};

export function ClaimHandleForm({ defaultDisplayName }: { defaultDisplayName: string }) {
  const [state, action, pending] = useActionState(claimHandle, initialState);

  return (
    <form action={action} className="mt-8 space-y-5">
      <label className="block">
        <span className="text-xs font-black uppercase tracking-[.16em] text-white/45">Display name</span>
        <input
          name="displayName"
          required
          maxLength={60}
          defaultValue={defaultDisplayName}
          autoComplete="name"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3.5 outline-none transition focus:border-[var(--accent)]/60"
        />
      </label>

      <label className="block">
        <span className="text-xs font-black uppercase tracking-[.16em] text-white/45">Your Mechi ID</span>
        <div className="mt-2 flex items-center rounded-2xl border border-white/10 bg-white/[.04] focus-within:border-[var(--accent)]/60">
          <span className="pl-4 text-sm text-white/35">@</span>
          <input
            name="handle"
            required
            minLength={3}
            maxLength={20}
            pattern="[a-z0-9_]{3,20}"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="yourhandle"
            className="min-w-0 flex-1 bg-transparent px-1 py-3.5 pr-4 outline-none placeholder:text-white/20"
          />
        </div>
        <p className="mt-2 text-xs leading-5 text-white/35">3–20 lowercase letters, numbers or underscores. Your final claim is atomic, so two people cannot own the same ID.</p>
      </label>

      {state.error ? (
        <p role="alert" className="rounded-2xl border border-red-400/15 bg-red-400/[.06] px-4 py-3 text-sm text-red-100/80">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-[var(--accent)] px-5 py-3.5 text-sm font-black text-[var(--accent-ink)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? 'Claiming…' : 'Claim my Mechi ID'}
      </button>
    </form>
  );
}
