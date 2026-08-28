'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type ClaimHandleState = {
  error?: string;
};

const HANDLE_PATTERN = /^[a-z0-9_]{3,20}$/;

export async function claimHandle(
  _previousState: ClaimHandleState,
  formData: FormData,
): Promise<ClaimHandleState> {
  const handle = String(formData.get('handle') ?? '').trim().toLowerCase();
  const displayName = String(formData.get('displayName') ?? '').trim();

  if (!HANDLE_PATTERN.test(handle)) {
    return { error: 'Use 3–20 lowercase letters, numbers or underscores.' };
  }

  if (!displayName || displayName.length > 60) {
    return { error: 'Add a display name between 1 and 60 characters.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Your session expired. Log in and try again.' };
  }

  const { data: existing } = await supabase
    .from('mechi_profiles')
    .select('handle')
    .eq('id', user.id)
    .maybeSingle();

  if (existing) redirect('/me');

  const { error } = await supabase.from('mechi_profiles').insert({
    id: user.id,
    handle,
    display_name: displayName,
    onboarding_step: 2,
  });

  if (error) {
    if (error.code === '23505') {
      return { error: `@${handle} is already claimed. Try another Mechi ID.` };
    }

    if (error.code === '23514' || error.message.includes('reserved_mechi_handle')) {
      return { error: 'That Mechi ID is unavailable. Try another handle.' };
    }

    return { error: 'We could not claim that Mechi ID. Try again.' };
  }

  redirect('/me');
}
