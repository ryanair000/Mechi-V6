import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('mechi_profiles')
    .select('handle, display_name, bio, city, country_code, profile_completed_at')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) redirect('/onboarding');
  if (!profile.profile_completed_at) redirect('/onboarding/profile');

  const [{ count: gameCount }, { count: platformCount }, { count: publicGamerCount }] = await Promise.all([
    supabase
      .from('mechi_profile_games')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.id),
    supabase
      .from('mechi_profile_platforms')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.id),
    supabase
      .from('mechi_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('profile_visibility', 'public')
      .not('profile_completed_at', 'is', null),
  ]);

  const location = [profile.city, profile.country_code].filter(Boolean).join(', ');

  return (
    <section className="max-w-5xl pb-16">
      <p className="text-sm font-black uppercase tracking-[.16em] text-[var(--accent)]">Home</p>
      <h1 className="mt-3 text-5xl font-black tracking-[-.055em]">Yo {profile.display_name}.</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-white/50">Your gamer identity is published. Keep it sharp, share it, and start finding people who play what you play.</p>

      <div className="mt-9 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <article className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#0e1218] p-6 sm:p-8">
          <div className="absolute right-0 top-0 size-48 bg-[radial-gradient(circle,rgba(184,255,44,.15),transparent_68%)]" />
          <div className="relative">
            <p className="text-xs font-black uppercase tracking-[.16em] text-white/30">Your Mechi</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-.04em]">@{profile.handle}</h2>
            {location ? <p className="mt-2 text-sm font-bold text-white/40">{location}</p> : null}
            {profile.bio ? <p className="mt-5 max-w-xl text-sm leading-6 text-white/60">{profile.bio}</p> : null}

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={`/@${profile.handle}`}
                className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-black text-[var(--accent-ink)]"
              >
                View public profile
              </Link>
              <Link
                href="/me"
                className="rounded-full border border-white/10 bg-white/[.035] px-5 py-3 text-sm font-black text-white"
              >
                Manage my Mechi
              </Link>
            </div>
          </div>
        </article>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <article className="rounded-3xl border border-white/8 bg-[#0e1218] p-5">
            <p className="text-xs font-black uppercase tracking-[.14em] text-white/30">Games</p>
            <p className="mt-3 text-3xl font-black">{gameCount ?? 0}</p>
          </article>
          <article className="rounded-3xl border border-white/8 bg-[#0e1218] p-5">
            <p className="text-xs font-black uppercase tracking-[.14em] text-white/30">Platforms</p>
            <p className="mt-3 text-3xl font-black">{platformCount ?? 0}</p>
          </article>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-white/8 bg-[#0e1218] p-6">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[var(--accent)]">Discover</p>
          <h2 className="mt-3 text-xl font-black">Find people worth playing with.</h2>
          <p className="mt-2 text-sm leading-6 text-white/45">There {publicGamerCount === 1 ? 'is' : 'are'} {publicGamerCount ?? 0} published gamer {publicGamerCount === 1 ? 'identity' : 'identities'} on Mechi right now.</p>
          <Link href="/discover" className="mt-5 inline-block text-sm font-black text-[var(--accent)]">Explore gamers →</Link>
        </article>

        <article className="rounded-3xl border border-white/8 bg-[#0e1218] p-6">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[var(--accent)]">Share</p>
          <h2 className="mt-3 text-xl font-black">One link for your gamer identity.</h2>
          <p className="mt-2 text-sm leading-6 text-white/45">Your public Mechi is ready for WhatsApp, Discord, Instagram bio and anywhere else your gaming circle lives.</p>
          <Link href={`/@${profile.handle}`} className="mt-5 inline-block text-sm font-black text-[var(--accent)]">Open shareable profile →</Link>
        </article>
      </div>
    </section>
  );
}
