import { redirect } from 'next/navigation';
import { MechiMark } from '@/components/brand/mechi-mark';
import { CompleteProfileForm } from '@/features/identity/components/complete-profile-form';
import { createClient } from '@/lib/supabase/server';

export default async function ProfileOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('mechi_profiles')
    .select('handle, display_name, bio, country_code, city, gaming_styles, profile_completed_at')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) redirect('/onboarding');
  if (profile.profile_completed_at) redirect('/me');

  const [{ data: games }, { data: platforms }, { data: profileGames }, { data: profilePlatforms }] = await Promise.all([
    supabase
      .from('mechi_games')
      .select('id, name, short_name')
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('mechi_platforms')
      .select('id, name')
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('mechi_profile_games')
      .select('game_id')
      .eq('profile_id', user.id),
    supabase
      .from('mechi_profile_platforms')
      .select('platform_id')
      .eq('profile_id', user.id),
  ]);

  return (
    <main className="min-h-screen px-5 py-8 pb-20">
      <div className="mx-auto max-w-3xl">
        <MechiMark />
        <section className="mt-12 rounded-[2rem] border border-white/8 bg-[#0e1218] p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/8 pb-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--accent)]">Finish your Mechi</p>
              <h1 className="mt-3 text-4xl font-black tracking-[-.045em] sm:text-5xl">@{profile.handle} is yours.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">Now make the profile worth sharing. Choose the games, platforms and identity details people should know about you.</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-xs font-black text-white/45">FINAL SETUP</span>
          </div>

          <CompleteProfileForm
            profile={{
              displayName: profile.display_name,
              bio: profile.bio ?? '',
              countryCode: profile.country_code ?? 'KE',
              city: profile.city ?? '',
              gamingStyles: profile.gaming_styles ?? [],
              gameIds: (profileGames ?? []).map((row) => row.game_id),
              platformIds: (profilePlatforms ?? []).map((row) => row.platform_id),
            }}
            games={games ?? []}
            platforms={platforms ?? []}
          />
        </section>
      </div>
    </main>
  );
}
