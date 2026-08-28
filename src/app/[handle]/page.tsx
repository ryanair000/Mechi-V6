import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MechiMark } from '@/components/brand/mechi-mark';
import { ShareProfileButton } from '@/features/profiles/components/share-profile-button';
import { createClient } from '@/lib/supabase/server';

type PageProps = {
  params: Promise<{ handle: string }>;
};

function parseHandle(raw: string) {
  const decoded = decodeURIComponent(raw).toLowerCase();
  if (!decoded.startsWith('@')) return null;
  const handle = decoded.slice(1);
  return /^[a-z0-9_]{3,20}$/.test(handle) ? handle : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle: rawHandle } = await params;
  const handle = parseHandle(rawHandle);
  if (!handle) return {};

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('mechi_profiles')
    .select('display_name, handle, bio')
    .eq('handle', handle)
    .maybeSingle();

  if (!profile) return {};

  return {
    title: `${profile.display_name} (@${profile.handle})`,
    description: profile.bio || `See @${profile.handle}'s gamer identity on Mechi.`,
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { handle: rawHandle } = await params;
  const handle = parseHandle(rawHandle);
  if (!handle) notFound();

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('mechi_profiles')
    .select('id, handle, display_name, bio, avatar_url, banner_url, country_code, city, gaming_styles, show_city, show_accounts, profile_completed_at, created_at')
    .eq('handle', handle)
    .maybeSingle();

  if (!profile) notFound();

  const [{ data: gameRows }, { data: platformRows }, { data: accounts }] = await Promise.all([
    supabase
      .from('mechi_profile_games')
      .select('game_id, is_primary, is_favorite, skill_style')
      .eq('profile_id', profile.id),
    supabase
      .from('mechi_profile_platforms')
      .select('platform_id, is_primary')
      .eq('profile_id', profile.id),
    profile.show_accounts
      ? supabase
          .from('mechi_external_accounts')
          .select('provider, username, verification_status')
          .eq('profile_id', profile.id)
          .order('provider')
      : Promise.resolve({ data: [] }),
  ]);

  const gameIds = (gameRows ?? []).map((row) => row.game_id);
  const platformIds = (platformRows ?? []).map((row) => row.platform_id);

  const [{ data: gameCatalog }, { data: platformCatalog }] = await Promise.all([
    gameIds.length
      ? supabase.from('mechi_games').select('id, name, short_name, genres').in('id', gameIds)
      : Promise.resolve({ data: [] }),
    platformIds.length
      ? supabase.from('mechi_platforms').select('id, name').in('id', platformIds)
      : Promise.resolve({ data: [] }),
  ]);

  const gamesById = new Map((gameCatalog ?? []).map((game) => [game.id, game]));
  const platformsById = new Map((platformCatalog ?? []).map((platform) => [platform.id, platform]));

  const games = (gameRows ?? [])
    .map((row) => ({ ...row, game: gamesById.get(row.game_id) }))
    .filter((row) => row.game)
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary));

  const platforms = (platformRows ?? [])
    .map((row) => ({ ...row, platform: platformsById.get(row.platform_id) }))
    .filter((row) => row.platform)
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary));

  const location = [profile.show_city ? profile.city : null, profile.country_code]
    .filter(Boolean)
    .join(', ');
  const initials = String(profile.display_name)
    .split(/\s+/)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join('');
  const gamingStyles = Array.isArray(profile.gaming_styles)
    ? profile.gaming_styles.filter((style): style is string => typeof style === 'string')
    : [];

  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-5xl px-5 py-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="Mechi home"><MechiMark /></Link>
          <Link href="/signup" className="rounded-full bg-white px-4 py-2.5 text-sm font-black text-black">
            Claim your Mechi
          </Link>
        </div>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/8 bg-[#0e1218]">
          <div className="relative h-44 bg-[radial-gradient(circle_at_80%_10%,rgba(184,255,44,.28),transparent_35%),linear-gradient(120deg,#202a36,#10151c)]">
            {profile.banner_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.banner_url} alt="" className="size-full object-cover" />
            ) : null}
          </div>

          <div className="px-6 pb-7 sm:px-8">
            <div className="-mt-14 flex flex-wrap items-end justify-between gap-5">
              <div className="flex items-end gap-4">
                <div className="grid size-28 shrink-0 place-items-center overflow-hidden rounded-[2rem] border-4 border-[#0e1218] bg-[#232c38] text-3xl font-black">
                  {profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt={profile.display_name} className="size-full object-cover" />
                  ) : initials || 'M'}
                </div>
                <div className="pb-1">
                  <h1 className="text-3xl font-black tracking-[-.045em] sm:text-4xl">{profile.display_name}</h1>
                  <p className="mt-1 text-sm font-bold text-white/45">@{profile.handle}</p>
                </div>
              </div>
              <ShareProfileButton handle={profile.handle} displayName={profile.display_name} />
            </div>

            {location ? <p className="mt-5 text-sm font-bold text-white/45">{location}</p> : null}
            {profile.bio ? <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">{profile.bio}</p> : null}

            {gamingStyles.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {gamingStyles.map((style: string) => (
                  <span key={style} className="rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/[.07] px-3 py-1.5 text-xs font-black capitalize text-[var(--accent)]">
                    {style.replaceAll('-', ' ')}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <section className="rounded-[2rem] border border-white/8 bg-[#0e1218] p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--accent)]">Games</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">What {profile.display_name} plays</h2>
              </div>
              <span className="text-sm font-bold text-white/25">{games.length}</span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {games.length ? games.map(({ game, is_primary, is_favorite, skill_style }) => (
                <article key={game!.id} className="rounded-2xl border border-white/8 bg-white/[.025] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black">{game!.short_name || game!.name}</h3>
                      <p className="mt-1 text-xs capitalize text-white/35">{skill_style}</p>
                    </div>
                    {is_primary ? <span className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-[10px] font-black text-[var(--accent-ink)]">PRIMARY</span> : is_favorite ? <span className="text-xs text-white/30">Favorite</span> : null}
                  </div>
                </article>
              )) : (
                <p className="text-sm text-white/40">No games added yet.</p>
              )}
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-[2rem] border border-white/8 bg-[#0e1218] p-6">
              <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--accent)]">Platforms</p>
              <div className="mt-4 space-y-2">
                {platforms.length ? platforms.map(({ platform, is_primary }) => (
                  <div key={platform!.id} className="flex items-center justify-between rounded-2xl bg-white/[.03] px-4 py-3 text-sm font-bold">
                    <span>{platform!.name}</span>
                    {is_primary ? <span className="text-[10px] font-black text-[var(--accent)]">MAIN</span> : null}
                  </div>
                )) : <p className="text-sm text-white/40">No platforms added yet.</p>}
              </div>
            </section>

            {accounts?.length ? (
              <section className="rounded-[2rem] border border-white/8 bg-[#0e1218] p-6">
                <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--accent)]">Gaming accounts</p>
                <div className="mt-4 space-y-3">
                  {accounts.map((account) => (
                    <div key={`${account.provider}:${account.username}`} className="rounded-2xl border border-white/8 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-black capitalize">{account.provider}</span>
                        <span className="text-[10px] font-black uppercase text-white/35">{account.verification_status.replaceAll('_', ' ')}</span>
                      </div>
                      <p className="mt-1 text-sm text-white/50">{account.username}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
