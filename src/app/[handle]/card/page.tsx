import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MechiMark } from '@/components/brand/mechi-mark';
import { CardActions } from '@/features/cards/components/card-actions';
import { getCardData } from '@/features/cards/server/get-card-data';
import { parsePublicHandle } from '@/features/identity/lib/public-handle';

type PageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle: rawHandle } = await params;
  const handle = parsePublicHandle(rawHandle);
  if (!handle) return {};

  const card = await getCardData(handle);
  if (!card) return {};

  const title = `${card.displayName}'s Mechi Card`;
  const description = `@${card.handle} — games, platforms and gamer identity on Mechi.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      images: [{ url: `/@${card.handle}/card/image`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/@${card.handle}/card/image`],
    },
  };
}

export default async function MechiCardPage({ params }: PageProps) {
  const { handle: rawHandle } = await params;
  const handle = parsePublicHandle(rawHandle);
  if (!handle) notFound();

  const card = await getCardData(handle);
  if (!card) notFound();

  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-6xl px-5 py-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="Mechi home"><MechiMark /></Link>
          <Link href="/signup" className="rounded-full bg-white px-4 py-2.5 text-sm font-black text-black">
            Claim your Mechi
          </Link>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <section>
            <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--accent)]">Mechi Card</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-.05em] sm:text-5xl">Built to be shared.</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/50">
              One visual snapshot of @{card.handle}: who they are, what they play and where they play.
            </p>

            <div className="mt-7 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0e1218] shadow-2xl shadow-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/@${card.handle}/card/image`}
                alt={`${card.displayName}'s Mechi Card`}
                className="block w-full"
              />
            </div>

            <div className="mt-6">
              <CardActions handle={card.handle} displayName={card.displayName} />
            </div>
          </section>

          <aside className="rounded-[2rem] border border-white/8 bg-[#0e1218] p-6 lg:sticky lg:top-6">
            <p className="text-xs font-black uppercase tracking-[.18em] text-white/30">Scan to profile</p>
            <div className="mt-5 rounded-3xl bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/@${card.handle}/card/qr`} alt={`QR code for @${card.handle}`} className="w-full" />
            </div>
            <p className="mt-4 text-center text-sm font-black">@{card.handle}</p>
            <p className="mt-1 text-center text-xs leading-5 text-white/35">The QR always points to the live Mechi profile, so the card can keep circulating as the profile evolves.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
