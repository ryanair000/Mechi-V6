'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type ClaimHandleState = {
  error?: string;
};

export type CompleteProfileState = {
  error?: string;
};

const HANDLE_PATTERN = /^[a-z0-9_]{3,20}$/;
const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;
const ALLOWED_STYLES = new Set([
  'competitive',
  'casual',
  'chill',
  'ranked-grinder',
  'weekend-gamer',
  'content-creator',
  'speedrunner',
  'collector',
  'esports',
  'sports-games',
  'fps',
  'racing',
  'fighting-games',
  'rpg',
]);

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
    .select('handle, profile_completed_at')
    .eq('id', user.id)
    .maybeSingle();

  if (existing) {
    redirect(existing.profile_completed_at ? '/me' : '/onboarding/profile');
  }

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

  redirect('/onboarding/profile');
}

export async function completeProfile(
  _previousState: CompleteProfileState,
  formData: FormData,
): Promise<CompleteProfileState> {
  const displayName = String(formData.get('displayName') ?? '').trim();
  const bio = String(formData.get('bio') ?? '').trim();
  const countryCode = String(formData.get('countryCode') ?? '').trim().toUpperCase();
  const city = String(formData.get('city') ?? '').trim();
  const gamingStyles = formData.getAll('gamingStyles').map(String);
  const gameIds = formData.getAll('gameIds').map(String);
  const platformIds = formData.getAll('platformIds').map(String);

  if (!displayName || displayName.length > 60) {
    return { error: 'Display name must be between 1 and 60 characters.' };
  }

  if (bio.length > 160) {
    return { error: 'Keep your gamer bio to 160 characters or fewer.' };
  }

  if (countryCode && !COUNTRY_CODE_PATTERN.test(countryCode)) {
    return { error: 'Use a two-letter country code such as KE.' };
  }

  if (city.length > 80) {
    return { error: 'City must be 80 characters or fewer.' };
  }

  if (gamingStyles.length > 3 || gamingStyles.some((style) => !ALLOWED_STYLES.has(style))) {
    return { error: 'Choose up to three valid gamer styles.' };
  }

  if (new Set(gameIds).size < 2 || new Set(gameIds).size > 10) {
    return { error: 'Choose between 2 and 10 games.' };
  }

  if (new Set(platformIds).size < 1 || new Set(platformIds).size > 4) {
    return { error: 'Choose between 1 and 4 platforms.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Your session expired. Log in and try again.' };
  }

  const { data: profile } = await supabase
    .from('mechi_profiles')
    .select('handle')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    redirect('/onboarding');
  }

  const { error } = await supabase.rpc('mechi_complete_onboarding', {
    p_display_name: displayName,
    p_bio: bio || null,
    p_country_code: countryCode || null,
    p_city: city || null,
    p_gaming_styles: gamingStyles,
    p_game_ids: gameIds,
    p_platform_ids: platformIds,
  });

  if (error) {
    const message = error.message ?? '';

    if (message.includes('mechi_choose_2_to_10_games')) {
      return { error: 'Choose between 2 and 10 active games.' };
    }

    if (message.includes('mechi_choose_1_to_4_platforms')) {
      return { error: 'Choose between 1 and 4 active platforms.' };
    }

    if (message.includes('gaming_styles') || message.includes('mechi_invalid_gaming_style')) {
      return { error: 'Choose up to three gamer styles.' };
    }

    return { error: 'We could not finish your profile. Review your selections and try again.' };
  }

  redirect(`/@${profile.handle}`);
}
