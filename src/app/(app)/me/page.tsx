import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/features/auth/components/sign-out-button';
import { createClient } from '@/lib/supabase/server';

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('mechi_profiles')
    .select('handle, display_name, bio, city, country_code, gaming_styles, profile_completed_at, created_at')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) redirect('/onboarding');
  if (!profile.profile_completed_at) redirect('/onboarding/profile');

  const [{ count: gameCount }, { count: platformCount }] = await Promise.all([
    supabase
      .from('mechi_profile_games')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.id),
    supabase
      .from('mechi_profile_platforms')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.id),
  ]);

  const location = [profile.city, profile.country_code].filter(Boolean).join(', ');
  const styles = Array.isArray(profile.gaming_styles)
    ? profile.gaming_styles.filter((style): style is string => typeof style === 'string')
    : [];

  return (
    <section className="max-w-4xl pb-16">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-sm font-black uppercase tracking-[.16em] text-[var(--accent)]">Your Mechi</p>
          <h1 className="mt-3 text-5xl font-black tracking-[-.055em]">{profile.display_name}</h1>
          <p className="mt-2 text-lg font-bold text-white/45">@{profile.handle}</p>
          {location ? <p className="mt-3 text-sm font-bold text-white/35">{location}</p> : null}
        </div>
        <SignOutButton />
      </div>

      {profile.bio ? (
        <p className="mt-7 max-w-2xl text-base leading-7 text-white/65">{profile.bio}</p>
      ) : null}

      {styles.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {styles.map((style: string) => (
            <span key={style} className="rounded-full border border-white/10 bg-white/[.035] px-3 py-1.5 text-xs font-black capitalize text-white/55">
              {style.replaceAll('-', ' ')}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <article className="rounded-3xl border border-white/8 bg-[#0e1218] p-6">
          <p className="text-xs font-black uppercase tracking-[.16em] text-white/30">Games</p>
          <p className="mt-4 text-4xl font-black">{gameCount ?? 0}</p>
          <p className="mt-1 text-sm text-white/40">on your identity</p>
        </article>
        <article className="rounded-3xl border border-white/8 bg-[#0e1218] p-6">
          <p className="text-xs font-black uppercase tracking-[.16em] text-white/30">Platforms</p>
          <p className="mt-4 text-4xl font-black">{platformCount ?? 0}</p>
          <p className="mt-1 text-sm text-white/40">where you play</p>
        </article>
        <article className="rounded-3xl border border-white/8 bg-[#0e1218] p-6">
          <p className="text-xs font-black uppercase tracking-[.16em] text-white/30">Status</p>
          <p className="mt-4 text-xl font-black text-[var(--accent)]">Published</p>
          <p className="mt-2 text-sm text-white/40">your Mechi is public</p>
        </article>
      </div>

      <div className="mt-5 rounded-[2rem] border border-white/8 bg-[#0e1218] p-6 sm:p-7">
        <p className="text-xs font-black uppercase tracking-[.16em] text-white/30">Public identity</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-lg font-black">mechi-v6.vercel.app/@{profile.handle}</p>
            <p className="mt-1 text-sm text-white/40">This is the profile you can share anywhere.</p>
          </div>
          <Link
            href={`/@${profile.handle}`}
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-black text-[var(--accent-ink)]"
          >
            View public profile
          </Link>
        </div>
      </div>
    </section>
  );
}
