import { redirect } from 'next/navigation';
import { MechiMark } from '@/components/brand/mechi-mark';
import { ClaimHandleForm } from '@/features/identity/components/claim-handle-form';
import { hasSupabaseEnv } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';

export default async function OnboardingPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
        <MechiMark />
        <div className="mt-20 rounded-[2rem] border border-white/8 bg-[#0e1218] p-8">
          <h1 className="text-3xl font-black">Backend not configured.</h1>
          <p className="mt-3 text-sm leading-6 text-white/50">Add the Supabase public environment variables to enable Mechi ID onboarding.</p>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('mechi_profiles')
    .select('handle')
    .eq('id', user.id)
    .maybeSingle();

  if (profile) redirect('/me');

  const metadataName = typeof user.user_metadata?.full_name === 'string'
    ? user.user_metadata.full_name
    : '';

  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-lg">
        <MechiMark />
        <section className="mt-16 rounded-[2rem] border border-white/8 bg-[#0e1218] p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--accent)]">Step 1 of 6</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-.045em]">Claim your Mechi ID.</h1>
          <p className="mt-3 text-sm leading-6 text-white/50">This becomes your permanent gamer identity and public profile handle.</p>
          <ClaimHandleForm defaultDisplayName={metadataName} />
        </section>
      </div>
    </main>
  );
}
