import { redirect } from 'next/navigation';
import { SignOutButton } from '@/features/auth/components/sign-out-button';
import { hasSupabaseEnv } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';

export default async function MePage() {
  if (!hasSupabaseEnv()) {
    return (
      <section className="max-w-3xl">
        <p className="text-sm font-bold text-[var(--accent)]">MECHI ID</p>
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
    .select('handle, display_name, bio, city, country_code, onboarding_step, created_at')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) redirect('/onboarding');

  return (
    <section className="max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[var(--accent)]">MECHI ID</p>
          <h1 className="mt-2 text-5xl font-black tracking-[-.055em]">{profile.display_name}</h1>
          <p className="mt-2 text-lg font-bold text-white/50">@{profile.handle}</p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <article className="rounded-3xl border border-white/8 bg-[#0e1218] p-6">
          <p className="text-xs font-black uppercase tracking-[.16em] text-white/35">Your profile</p>
          <p className="mt-4 text-lg font-black">mechi.gg/@{profile.handle}</p>
          <p className="mt-2 text-sm leading-6 text-white/45">Your Mechi ID is live. Profile editing, games and platforms are the next onboarding steps.</p>
        </article>
        <article className="rounded-3xl border border-white/8 bg-[#0e1218] p-6">
          <p className="text-xs font-black uppercase tracking-[.16em] text-white/35">Onboarding</p>
          <p className="mt-4 text-3xl font-black">Step {profile.onboarding_step} / 7</p>
          <p className="mt-2 text-sm leading-6 text-white/45">Identity claimed. Next: avatar, location, games, platforms and gamer style.</p>
        </article>
      </div>
    </section>
  );
}
