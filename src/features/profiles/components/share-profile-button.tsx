'use client';

import { useState } from 'react';

export function ShareProfileButton({ handle, displayName }: { handle: string; displayName: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/@${handle}`;
    const text = `${displayName} on Mechi — @${handle}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `${displayName} on Mechi`, text, url });
        return;
      } catch {
        // Falling back to copy is intentional when the native share sheet is dismissed or unavailable.
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={share}
      className="rounded-full border border-white/12 bg-white/[.04] px-4 py-2.5 text-sm font-black text-white transition hover:border-white/25 hover:bg-white/[.07]"
    >
      {copied ? 'Link copied' : 'Share Mechi'}
    </button>
  );
}
