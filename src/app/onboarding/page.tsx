import { redirect } from 'next/navigation';
import { MechiMark } from '@/components/brand/mechi-mark';
import { ClaimHandleForm } from '@/features/identity/components/claim-handle-form';
import { createClient } from '@/lib/supabase/server';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('mechi_profiles')
    .select('handle, profile_completed_at')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.profile_completed_at) redirect('/me');
  if (profile) redirect('/onboarding/profile');

  const metadataName = typeof user.user_metadata?.full_name === 'string'
    ? user.user_metadata.full_name
    : '';

  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-lg">
        <MechiMark />
        <section className="mt-16 rounded-[2rem] border border-white/8 bg-[#0e1218] p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--accent)]">Start here</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-.045em]">Claim your Mechi ID.</h1>
          <p className="mt-3 text-sm leading-6 text-white/50">This becomes your permanent gamer identity and public profile handle.</p>
          <ClaimHandleForm defaultDisplayName={metadataName} />
        </section>
      </div>
    </main>
  );
}
