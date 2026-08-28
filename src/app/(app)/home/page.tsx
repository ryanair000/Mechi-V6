import Link from 'next/link';
import { redirect } from 'next/navigation';
import { hasSupabaseEnv } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  if (!hasSupabaseEnv()) {
    return (
      <section>
        <p className="text-sm font-bold text-[var(--accent)]">HOME</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-.045em]">Backend not configured.</h1>
      </section>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('mechi_profiles')
    .select('handle, display_name, onboarding_step')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) redirect('/onboarding');

  const modules = [
    ['Your Mechi', `@${profile.handle} is claimed. Keep building the identity people will want to visit and share.`],
    ['People worth meeting', 'Discovery will use your games, platform and location instead of an empty lobby.'],
    ['What changed', 'Meaningful profile and identity activity will live here — not a generic social feed.'],
  ];

  return (
    <section>
      <p className="text-sm font-bold text-[var(--accent)]">HOME</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-.045em]">Yo {profile.display_name}.</h1>
      <p className="mt-3 text-white/50">Your Mechi ID is live. You are on onboarding step {profile.onboarding_step} of 7.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {modules.map(([title, copy], index) => (
          <article key={title} className="min-h-48 rounded-3xl border border-white/8 bg-[#0e1218] p-6">
            <h2 className="text-lg font-black">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/50">{copy}</p>
            {index === 0 ? <Link href="/me" className="mt-6 inline-block text-sm font-black text-[var(--accent)]">Open my Mechi →</Link> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
