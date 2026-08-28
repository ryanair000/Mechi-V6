import Link from 'next/link';
import { MechiMark } from '@/components/brand/mechi-mark';
import { DemoCard } from '@/components/gamer/demo-card';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <MechiMark />
        <div className="flex items-center gap-2">
          <Link href="/discover" className="rounded-full px-4 py-2 text-sm font-semibold text-white/70 hover:text-white">Explore gamers</Link>
          <Link href="/me" className="rounded-full bg-white px-4 py-2 text-sm font-black text-black">Claim your ID</Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-24 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pt-24">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/[.035] px-3 py-1.5 text-xs font-bold uppercase tracking-[.18em] text-white/55">Mechi V6 · Identity first</div>
          <h1 className="max-w-3xl text-6xl font-black leading-[.92] tracking-[-.065em] sm:text-7xl">Your gamer identity. <span className="text-[var(--accent)]">All in one place.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/60">Build your gamer profile, show everything you play, find gamers like you, and share one Mechi everywhere.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/me" className="rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-black text-[var(--accent-ink)]">Claim your Mechi ID</Link>
            <Link href="/discover" className="rounded-full border border-white/12 bg-white/[.035] px-6 py-3.5 text-sm font-black">Explore gamers</Link>
          </div>
          <p className="mt-5 text-xs text-white/35">No empty lobbies. No tournament maze. Identity first.</p>
        </div>
        <DemoCard />
      </section>

      <section className="border-y border-white/8 bg-white/[.018]">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-12 md:grid-cols-3">
          {[
            ['01', 'Claim your ID', 'Own a permanent handle and one public gaming profile.'],
            ['02', 'Show your games', 'Add platforms, games, gamertags and the way you like to play.'],
            ['03', 'Find your people', 'Discover gamers by game, platform and location.'],
          ].map(([n, title, copy]) => (
            <article key={n} className="rounded-3xl border border-white/8 bg-[#0e1218] p-6">
              <span className="text-xs font-black text-[var(--accent)]">{n}</span>
              <h2 className="mt-8 text-xl font-black tracking-tight">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/50">{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
