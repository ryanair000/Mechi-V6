'use client';

import { useState } from 'react';

export function CardActions({ handle, displayName }: { handle: string; displayName: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const profileUrl = `${window.location.origin}/@${handle}`;
    const text = `${displayName} on Mechi — @${handle}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `${displayName}'s Mechi Card`, text, url: profileUrl });
        return;
      } catch {
        // Native share dismissal intentionally falls back to copying the profile link.
      }
    }

    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={share}
        className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-black text-[var(--accent-ink)] transition hover:brightness-110"
      >
        {copied ? 'Profile link copied' : 'Share card'}
      </button>
      <a
        href={`/@${handle}/card/image?download=1`}
        className="rounded-full border border-white/12 bg-white/[.04] px-5 py-3 text-sm font-black text-white transition hover:border-white/25 hover:bg-white/[.07]"
      >
        Download PNG
      </a>
      <a
        href={`/@${handle}`}
        className="rounded-full border border-white/12 px-5 py-3 text-sm font-black text-white/70 transition hover:text-white"
      >
        View profile
      </a>
    </div>
  );
}
