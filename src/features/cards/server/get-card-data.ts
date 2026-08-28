import { createClient } from '@/lib/supabase/server';

export type MechiCardData = {
  handle: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  location: string | null;
  gamingStyles: string[];
  games: Array<{ id: string; name: string; shortName: string | null; isPrimary: boolean }>;
  platforms: Array<{ id: string; name: string; isPrimary: boolean }>;
};

export async function getCardData(handle: string): Promise<MechiCardData | null> {
  const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase
    .from('mechi_profiles')
    .select('id, handle, display_name, bio, avatar_url, banner_url, country_code, city, gaming_styles, show_city, profile_completed_at')
    .eq('handle', handle)
    .maybeSingle();

  if (profileError || !profile?.profile_completed_at) return null;

  const [{ data: gameRows, error: gameRowsError }, { data: platformRows, error: platformRowsError }] = await Promise.all([
    supabase
      .from('mechi_profile_games')
      .select('game_id, is_primary')
      .eq('profile_id', profile.id),
    supabase
      .from('mechi_profile_platforms')
      .select('platform_id, is_primary')
      .eq('profile_id', profile.id),
  ]);

  if (gameRowsError || platformRowsError) return null;

  const gameIds = (gameRows ?? []).map((row) => row.game_id);
  const platformIds = (platformRows ?? []).map((row) => row.platform_id);

  const [{ data: gameCatalog, error: gameCatalogError }, { data: platformCatalog, error: platformCatalogError }] = await Promise.all([
    gameIds.length
      ? supabase.from('mechi_games').select('id, name, short_name').in('id', gameIds)
      : Promise.resolve({ data: [], error: null }),
    platformIds.length
      ? supabase.from('mechi_platforms').select('id, name').in('id', platformIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (gameCatalogError || platformCatalogError) return null;

  const gameById = new Map((gameCatalog ?? []).map((game) => [String(game.id), game]));
  const platformById = new Map((platformCatalog ?? []).map((platform) => [String(platform.id), platform]));

  const games = (gameRows ?? [])
    .map((row) => {
      const game = gameById.get(String(row.game_id));
      if (!game) return null;
      return {
        id: String(game.id),
        name: String(game.name),
        shortName: game.short_name ? String(game.short_name) : null,
        isPrimary: Boolean(row.is_primary),
      };
    })
    .filter((game): game is NonNullable<typeof game> => Boolean(game))
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

  const platforms = (platformRows ?? [])
    .map((row) => {
      const platform = platformById.get(String(row.platform_id));
      if (!platform) return null;
      return {
        id: String(platform.id),
        name: String(platform.name),
        isPrimary: Boolean(row.is_primary),
      };
    })
    .filter((platform): platform is NonNullable<typeof platform> => Boolean(platform))
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

  const gamingStyles = Array.isArray(profile.gaming_styles)
    ? profile.gaming_styles.filter((style): style is string => typeof style === 'string')
    : [];
  const location = [profile.show_city ? profile.city : null, profile.country_code]
    .filter(Boolean)
    .join(', ') || null;

  return {
    handle: String(profile.handle),
    displayName: String(profile.display_name),
    bio: profile.bio ? String(profile.bio) : null,
    avatarUrl: profile.avatar_url ? String(profile.avatar_url) : null,
    bannerUrl: profile.banner_url ? String(profile.banner_url) : null,
    location,
    gamingStyles,
    games,
    platforms,
  };
}
