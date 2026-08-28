// Supabase project URLs and publishable keys are public client configuration,
// not server secrets. Environment variables still override these defaults so
// Mechi can move to a dedicated Supabase project without code changes.
const DEFAULT_SUPABASE_URL = 'https://llmbgigriltgikzmfmnf.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Ds1dKUcxOThu2jtXZFkcIQ_yRu6qKLm';

export function hasSupabaseEnv() {
  return Boolean(getSupabasePublicEnv().url && getSupabasePublicEnv().publishableKey);
}

export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  return { url, publishableKey };
}
