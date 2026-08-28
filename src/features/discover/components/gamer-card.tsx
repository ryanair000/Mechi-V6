import Link from 'next/link';
import type { DiscoverProfile } from '@/features/discover/server/get-discover-data';

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function GamerCard({ profile }: { profile: DiscoverProfile }) {
  const location = [profile.city, profile.countryCode].filter(Boolean).join(', ');
  const visibleGames = profile.games.slice(0, 3);
  const visiblePlatforms = profile.platforms.slice(0, 2);

  return (
    <article className="group rounded-[2rem] border border-white/8 bg-[#0e1218] p-5 transition hover:border-white/16 hover:bg-[#111720]">
      <div className="flex items-start gap-4">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#232c38] text-lg font-black">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt={profile.displayName} className="size-full object-cover" />
          ) : initials(profile.displayName) || 'M'}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-black">{profile.displayName}</h2>
            {profile.verifiedAccounts > 0 ? (
              <span className="rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/[.07] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.08em] text-[var(--accent)]">
                {profile.verifiedAccounts} verified
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm font-bold text-white/40">@{profile.handle}</p>
          {location ? <p className="mt-2 text-xs font-bold text-white/30">{location}</p> : null}
        </div>
      </div>

      {profile.bio ? (
        <p className="mt-4 min-h-12 text-sm leading-6 text-white/55">{profile.bio}</p>
      ) : (
        <p className="mt-4 min-h-12 text-sm leading-6 text-white/30">Gaming identity on Mechi.</p>
      )}

      {visibleGames.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {visibleGames.map((game) => (
            <span
              key={game.slug}
              className={`rounded-full px-3 py-1.5 text-xs font-black ${
                game.isPrimary
                  ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                  : 'border border-white/8 bg-white/[.035] text-white/55'
              }`}
            >
              {game.shortName || game.name}
            </span>
          ))}
          {profile.games.length > visibleGames.length ? (
            <span className="rounded-full border border-white/8 px-3 py-1.5 text-xs font-bold text-white/30">
              +{profile.games.length - visibleGames.length}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex min-h-5 flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-white/30">
        {visiblePlatforms.map((platform) => (
          <span key={platform.slug}>{platform.name}{platform.isPrimary ? ' · main' : ''}</span>
        ))}
      </div>

      {profile.gamingStyles.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.gamingStyles.slice(0, 3).map((style) => (
            <span key={style} className="text-[11px] font-black uppercase tracking-[.08em] text-white/25">
              {style.replaceAll('-', ' ')}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-6 flex items-center gap-3">
        <Link
          href={`/@${profile.handle}`}
          className="flex-1 rounded-full bg-white px-4 py-2.5 text-center text-sm font-black text-black transition group-hover:bg-[var(--accent)]"
        >
          View Mechi
        </Link>
        <Link
          href={`/@${profile.handle}/card`}
          className="rounded-full border border-white/10 px-4 py-2.5 text-sm font-black text-white/65 hover:border-white/20 hover:text-white"
        >
          Card
        </Link>
      </div>
    </article>
  );
}
