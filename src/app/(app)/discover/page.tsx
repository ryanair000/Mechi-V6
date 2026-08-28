import Link from 'next/link';
import { GamerCard } from '@/features/discover/components/gamer-card';
import {
  GAMER_STYLES,
  getDiscoverData,
  type DiscoverFilters,
} from '@/features/discover/server/get-discover-data';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COUNTRY_PATTERN = /^[a-zA-Z]{2}$/;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function cleanText(value: string | string[] | undefined, max: number) {
  return one(value).trim().slice(0, max);
}

function cleanSlug(value: string | string[] | undefined) {
  const candidate = cleanText(value, 80).toLowerCase();
  return SLUG_PATTERN.test(candidate) ? candidate : '';
}

function cleanCountry(value: string | string[] | undefined) {
  const candidate = cleanText(value, 2).toUpperCase();
  return COUNTRY_PATTERN.test(candidate) ? candidate : '';
}

function cleanPage(value: string | string[] | undefined) {
  const parsed = Number.parseInt(one(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 100) : 1;
}

function buildHref(filters: DiscoverFilters, changes: Partial<DiscoverFilters>) {
  const next = { ...filters, ...changes };
  const params = new URLSearchParams();

  if (next.query) params.set('q', next.query);
  if (next.game) params.set('game', next.game);
  if (next.platform) params.set('platform', next.platform);
  if (next.country) params.set('country', next.country);
  if (next.city) params.set('city', next.city);
  if (next.style) params.set('style', next.style);
  if (next.page > 1) params.set('page', String(next.page));

  const query = params.toString();
  return query ? `/discover?${query}` : '/discover';
}

function countryLabel(code: string | null) {
  if (!code) return null;
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

export default async function DiscoverPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const candidateStyle = cleanText(raw.style, 40).toLowerCase();

  const filters: DiscoverFilters = {
    query: cleanText(raw.q, 80),
    game: cleanSlug(raw.game),
    platform: cleanSlug(raw.platform),
    country: cleanCountry(raw.country),
    city: cleanText(raw.city, 60),
    style: GAMER_STYLES.includes(candidateStyle as (typeof GAMER_STYLES)[number]) ? candidateStyle : '',
    page: cleanPage(raw.page),
  };

  const { profiles, games, platforms, hasNextPage } = await getDiscoverData(filters);
  const hasFilters = Boolean(
    filters.query || filters.game || filters.platform || filters.country || filters.city || filters.style,
  );

  const preferredGames = [
    'ea-sports-fc-26',
    'efootball',
    'call-of-duty',
    'fortnite',
    'grand-theft-auto-v',
    'valorant',
    'tekken-8',
    'rocket-league',
  ];
  const browseGames = [...games]
    .sort((a, b) => {
      const ai = preferredGames.indexOf(a.slug);
      const bi = preferredGames.indexOf(b.slug);
      if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    })
    .slice(0, 8);

  const activeGame = games.find((game) => game.slug === filters.game);
  const activePlatform = platforms.find((platform) => platform.slug === filters.platform);
  const location = [filters.city, countryLabel(filters.country)].filter(Boolean).join(', ');

  return (
    <section className="pb-20">
      <p className="text-sm font-black uppercase tracking-[.16em] text-[var(--accent)]">Discover</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-5xl font-black tracking-[-.055em] sm:text-6xl">Find your people.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/50">
            Search by gamer, gamertag, game or place. Mechi discovery is identity-first — no empty lobby required.
          </p>
        </div>
        <Link href="/signup" className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-black text-[var(--accent-ink)]">
          Claim your Mechi
        </Link>
      </div>

      <form method="get" className="mt-9 rounded-[2rem] border border-white/8 bg-[#0e1218] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            name="q"
            aria-label="Search gamers"
            defaultValue={filters.query}
            maxLength={80}
            placeholder="Search @handle, gamer, gamertag or game"
            className="min-w-0 flex-1 rounded-2xl border border-white/8 bg-black/20 px-5 py-4 text-base outline-none placeholder:text-white/25 focus:border-[var(--accent)]/50"
          />
          <button type="submit" className="rounded-2xl bg-white px-6 py-4 text-sm font-black text-black hover:bg-[var(--accent)]">
            Search
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[.14em] text-white/30">Game</span>
            <select name="game" defaultValue={filters.game} className="w-full rounded-xl border border-white/8 bg-[#121820] px-3 py-3 text-sm font-bold text-white outline-none">
              <option value="">All games</option>
              {games.map((game) => <option key={game.slug} value={game.slug}>{game.shortName || game.name}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[.14em] text-white/30">Platform</span>
            <select name="platform" defaultValue={filters.platform} className="w-full rounded-xl border border-white/8 bg-[#121820] px-3 py-3 text-sm font-bold text-white outline-none">
              <option value="">All platforms</option>
              {platforms.map((platform) => <option key={platform.slug} value={platform.slug}>{platform.name}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[.14em] text-white/30">Gamer style</span>
            <select name="style" defaultValue={filters.style} className="w-full rounded-xl border border-white/8 bg-[#121820] px-3 py-3 text-sm font-bold capitalize text-white outline-none">
              <option value="">Any style</option>
              {GAMER_STYLES.map((style) => <option key={style} value={style}>{style.replaceAll('-', ' ')}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[.14em] text-white/30">Country</span>
            <input
              name="country"
              defaultValue={filters.country}
              maxLength={2}
              placeholder="KE"
              className="w-full rounded-xl border border-white/8 bg-[#121820] px-3 py-3 text-sm font-bold uppercase text-white outline-none placeholder:text-white/20"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[.14em] text-white/30">City</span>
            <input
              name="city"
              defaultValue={filters.city}
              maxLength={60}
              placeholder="Nairobi"
              className="w-full rounded-xl border border-white/8 bg-[#121820] px-3 py-3 text-sm font-bold text-white outline-none placeholder:text-white/20"
            />
          </label>
        </div>
      </form>

      {hasFilters ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {filters.query ? <span className="rounded-full bg-white/[.05] px-3 py-1.5 text-xs font-bold text-white/55">“{filters.query}”</span> : null}
          {activeGame ? <span className="rounded-full bg-white/[.05] px-3 py-1.5 text-xs font-bold text-white/55">{activeGame.shortName || activeGame.name}</span> : null}
          {activePlatform ? <span className="rounded-full bg-white/[.05] px-3 py-1.5 text-xs font-bold text-white/55">{activePlatform.name}</span> : null}
          {filters.style ? <span className="rounded-full bg-white/[.05] px-3 py-1.5 text-xs font-bold capitalize text-white/55">{filters.style.replaceAll('-', ' ')}</span> : null}
          {location ? <span className="rounded-full bg-white/[.05] px-3 py-1.5 text-xs font-bold text-white/55">{location}</span> : null}
          <Link href="/discover" className="px-2 py-1.5 text-xs font-black text-[var(--accent)]">Clear all</Link>
        </div>
      ) : null}

      {!hasFilters && filters.page === 1 ? (
        <div className="mt-9 grid gap-4 lg:grid-cols-2">
          <section className="rounded-[2rem] border border-white/8 bg-[#0e1218] p-6">
            <p className="text-xs font-black uppercase tracking-[.16em] text-white/30">Browse by game</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {browseGames.map((game) => (
                <Link
                  key={game.slug}
                  href={buildHref(filters, { game: game.slug, page: 1 })}
                  className="rounded-full border border-white/8 bg-white/[.025] px-3.5 py-2 text-sm font-black text-white/60 hover:border-[var(--accent)]/30 hover:text-[var(--accent)]"
                >
                  {game.shortName || game.name}
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/8 bg-[#0e1218] p-6">
            <p className="text-xs font-black uppercase tracking-[.16em] text-white/30">Browse by platform</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <Link
                  key={platform.slug}
                  href={buildHref(filters, { platform: platform.slug, page: 1 })}
                  className="rounded-full border border-white/8 bg-white/[.025] px-3.5 py-2 text-sm font-black text-white/60 hover:border-[var(--accent)]/30 hover:text-[var(--accent)]"
                >
                  {platform.name}
                </Link>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      <div className="mt-10 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.16em] text-[var(--accent)]">
            {hasFilters ? 'Matches' : 'New on Mechi'}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-.035em]">
            {profiles.length ? `${profiles.length}${hasNextPage ? '+' : ''} gamer${profiles.length === 1 ? '' : 's'} on this page` : 'No public gamers here yet'}
          </h2>
        </div>
        {filters.page > 1 ? <span className="text-xs font-bold text-white/30">Page {filters.page}</span> : null}
      </div>

      {profiles.length ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => <GamerCard key={profile.id} profile={profile} />)}
        </div>
      ) : (
        <div className="mt-5 rounded-[2rem] border border-dashed border-white/10 bg-white/[.015] px-6 py-12 text-center">
          <p className="text-xl font-black">{hasFilters ? 'No exact match yet.' : 'The network starts with identities.'}</p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/40">
            {hasFilters
              ? 'Try a broader game, platform or location — or clear the filters. Discover only shows completed public profiles.'
              : 'Mechi does not fake activity or send you into an empty lobby. Complete a profile, share your Mechi Card and the first real gamers will appear here.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {hasFilters ? <Link href="/discover" className="rounded-full border border-white/10 px-5 py-3 text-sm font-black">Clear filters</Link> : null}
            <Link href="/signup" className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-black text-[var(--accent-ink)]">Claim your Mechi</Link>
          </div>
        </div>
      )}

      {(filters.page > 1 || hasNextPage) ? (
        <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Discover pagination">
          {filters.page > 1 ? (
            <Link href={buildHref(filters, { page: filters.page - 1 })} className="rounded-full border border-white/10 px-5 py-3 text-sm font-black text-white/65">
              ← Previous
            </Link>
          ) : <span />}
          {hasNextPage ? (
            <Link href={buildHref(filters, { page: filters.page + 1 })} className="rounded-full bg-white px-5 py-3 text-sm font-black text-black">
              Next →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}
