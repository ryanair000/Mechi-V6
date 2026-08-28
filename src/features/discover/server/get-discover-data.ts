import { createClient } from '@/lib/supabase/server';

export const DISCOVER_PAGE_SIZE = 24;

export const GAMER_STYLES = [
  'competitive',
  'casual',
  'ranked-grinder',
  'completionist',
  'social',
  'creator',
] as const;

export type DiscoverFilters = {
  query: string;
  game: string;
  platform: string;
  country: string;
  city: string;
  style: string;
  page: number;
};

export type DiscoverGame = {
  slug: string;
  name: string;
  shortName: string | null;
  isPrimary: boolean;
};

export type DiscoverPlatform = {
  slug: string;
  name: string;
  isPrimary: boolean;
};

export type DiscoverProfile = {
  id: string;
  handle: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  countryCode: string | null;
  city: string | null;
  gamingStyles: string[];
  createdAt: string;
  games: DiscoverGame[];
  platforms: DiscoverPlatform[];
  verifiedAccounts: number;
};

export type DiscoverCatalogItem = {
  slug: string;
  name: string;
  shortName?: string | null;
};

function cleanJsonArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function cleanGames(value: unknown): DiscoverGame[] {
  return cleanJsonArray(value)
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const raw = item as Record<string, unknown>;
      if (typeof raw.slug !== 'string' || typeof raw.name !== 'string') return null;
      return {
        slug: raw.slug,
        name: raw.name,
        shortName: typeof raw.shortName === 'string' ? raw.shortName : null,
        isPrimary: raw.isPrimary === true,
      } satisfies DiscoverGame;
    })
    .filter((item): item is DiscoverGame => Boolean(item));
}

function cleanPlatforms(value: unknown): DiscoverPlatform[] {
  return cleanJsonArray(value)
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const raw = item as Record<string, unknown>;
      if (typeof raw.slug !== 'string' || typeof raw.name !== 'string') return null;
      return {
        slug: raw.slug,
        name: raw.name,
        isPrimary: raw.isPrimary === true,
      } satisfies DiscoverPlatform;
    })
    .filter((item): item is DiscoverPlatform => Boolean(item));
}

function normalizeProfile(row: Record<string, unknown>): DiscoverProfile | null {
  if (
    typeof row.id !== 'string' ||
    typeof row.handle !== 'string' ||
    typeof row.display_name !== 'string' ||
    typeof row.created_at !== 'string'
  ) {
    return null;
  }

  return {
    id: row.id,
    handle: row.handle,
    displayName: row.display_name,
    bio: typeof row.bio === 'string' ? row.bio : null,
    avatarUrl: typeof row.avatar_url === 'string' ? row.avatar_url : null,
    countryCode: typeof row.country_code === 'string' ? row.country_code : null,
    city: typeof row.city === 'string' ? row.city : null,
    gamingStyles: Array.isArray(row.gaming_styles)
      ? row.gaming_styles.filter((style): style is string => typeof style === 'string')
      : [],
    createdAt: row.created_at,
    games: cleanGames(row.games),
    platforms: cleanPlatforms(row.platforms),
    verifiedAccounts: typeof row.verified_accounts === 'number' ? row.verified_accounts : 0,
  };
}

export async function getDiscoverData(filters: DiscoverFilters) {
  const supabase = await createClient();
  const offset = (filters.page - 1) * DISCOVER_PAGE_SIZE;

  const [profilesResult, gamesResult, platformsResult] = await Promise.all([
    supabase.rpc('mechi_discover_profiles', {
      p_query: filters.query || null,
      p_game_slug: filters.game || null,
      p_platform_slug: filters.platform || null,
      p_country_code: filters.country || null,
      p_city: filters.city || null,
      p_gaming_style: filters.style || null,
      p_limit: DISCOVER_PAGE_SIZE,
      p_offset: offset,
    }),
    supabase
      .from('mechi_games')
      .select('slug, name, short_name')
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('mechi_platforms')
      .select('slug, name')
      .eq('is_active', true)
      .order('name'),
  ]);

  if (profilesResult.error) {
    throw new Error(`Discover search failed: ${profilesResult.error.message}`);
  }

  const profiles = (profilesResult.data ?? [])
    .map((row) => normalizeProfile(row as Record<string, unknown>))
    .filter((profile): profile is DiscoverProfile => Boolean(profile));

  const games: DiscoverCatalogItem[] = (gamesResult.data ?? []).map((game) => ({
    slug: game.slug,
    name: game.name,
    shortName: game.short_name,
  }));

  const platforms: DiscoverCatalogItem[] = (platformsResult.data ?? []).map((platform) => ({
    slug: platform.slug,
    name: platform.name,
  }));

  return {
    profiles,
    games,
    platforms,
    hasNextPage: profiles.length === DISCOVER_PAGE_SIZE,
  };
}
