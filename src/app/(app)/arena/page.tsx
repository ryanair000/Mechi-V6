import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const COMPETITIVE_GAME_ORDER = ['ea-sports-fc-26', 'efootball'] as const;
const COMPETITIVE_GAME_SLUGS = new Set<string>(COMPETITIVE_GAME_ORDER);

function titleCase(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function activateCompetitiveProfile(formData: FormData) {
  'use server';

  if (process.env.MECHI_ARENA_ENABLED !== 'true') redirect('/home');

  const gameSlug = String(formData.get('gameSlug') ?? '').trim().toLowerCase();
  if (!COMPETITIVE_GAME_SLUGS.has(gameSlug)) {
    throw new Error('That game is not available in PlayMechi Arena.');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { error } = await supabase.rpc('mechi_activate_competitive_profile', {
    p_game_slug: gameSlug,
  });

  if (error) {
    throw new Error(`Could not activate competitive profile: ${error.message}`);
  }

  revalidatePath('/arena');
}

export default async function ArenaPage() {
  if (process.env.MECHI_ARENA_ENABLED !== 'true') notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('mechi_profiles')
    .select('id, handle, display_name, profile_completed_at')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) redirect('/onboarding');
  if (!profile.profile_completed_at) redirect('/onboarding/profile');

  const [{ data: configs }, { data: games }, { data: playerProfiles }] = await Promise.all([
    supabase
      .from('mechi_competitive_game_configs')
      .select('game_id, competition_enabled, ranked_enabled, tournament_enabled, cash_enabled, placement_match_count, verification_method, supported_modes, supported_platform_slugs, ruleset_version')
      .eq('competition_enabled', true),
    supabase
      .from('mechi_games')
      .select('id, slug, name, short_name')
      .in('slug', [...COMPETITIVE_GAME_ORDER]),
    supabase
      .from('mechi_player_game_profiles')
      .select('game_id, rating, rank_tier, rank_division, placements_completed, matches_played, wins, draws, losses, goals_for, goals_against, current_streak, best_win_streak, status')
      .eq('profile_id', user.id),
  ]);

  const configByGame = new Map((configs ?? []).map((config) => [config.game_id, config]));
  const playerProfileByGame = new Map((playerProfiles ?? []).map((item) => [item.game_id, item]));
  const gameBySlug = new Map((games ?? []).map((game) => [game.slug, game]));

  const arenaGames = COMPETITIVE_GAME_ORDER.map((slug) => gameBySlug.get(slug)).filter(Boolean);

  return (
    <section className="max-w-6xl pb-16">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[.16em] text-[var(--accent)]">PlayMechi Arena</p>
          <h1 className="mt-3 text-5xl font-black tracking-[-.055em]">Football starts here.</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/50">
            Build separate FC 26 and eFootball competitive identities. Arena is currently in development mode: profiles first, free ranked next, cash off.
          </p>
        </div>

        <div className="rounded-full border border-white/10 bg-white/[.035] px-4 py-2 text-xs font-black uppercase tracking-[.14em] text-white/45">
          @{profile.handle}
        </div>
      </div>

      <div className="mt-9 grid gap-5 lg:grid-cols-2">
        {arenaGames.map((game) => {
          if (!game) return null;

          const config = configByGame.get(game.id);
          if (!config) return null;

          const competitiveProfile = playerProfileByGame.get(game.id);
          const rankTier = competitiveProfile?.rank_tier ?? 'unranked';
          const rankDivision = competitiveProfile?.rank_division;
          const visibleRank = rankTier === 'unranked'
            ? 'Unranked'
            : `${titleCase(rankTier)}${rankDivision ? ` ${['', 'I', 'II', 'III'][rankDivision] ?? rankDivision}` : ''}`;

          return (
            <article key={game.id} className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#0e1218] p-6 sm:p-8">
              <div className="absolute right-0 top-0 size-56 bg-[radial-gradient(circle,rgba(184,255,44,.12),transparent_68%)]" />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.16em] text-white/30">Competitive game</p>
                    <h2 className="mt-3 text-3xl font-black tracking-[-.04em]">{game.short_name ?? game.name}</h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[.035] px-3 py-2 text-[10px] font-black uppercase tracking-[.14em] text-white/45">
                    Cash off
                  </span>
                </div>

                {competitiveProfile ? (
                  <>
                    <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-2xl border border-white/8 bg-black/20 p-4 sm:col-span-2">
                        <p className="text-[10px] font-black uppercase tracking-[.14em] text-white/30">Mechi Rank</p>
                        <p className="mt-2 text-2xl font-black">{visibleRank}</p>
                        <p className="mt-1 text-xs font-bold text-white/35">Rating {competitiveProfile.rating}</p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[.14em] text-white/30">Placements</p>
                        <p className="mt-2 text-2xl font-black">{competitiveProfile.placements_completed}/{config.placement_match_count}</p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[.14em] text-white/30">Record</p>
                        <p className="mt-2 text-sm font-black">{competitiveProfile.wins}W · {competitiveProfile.draws}D · {competitiveProfile.losses}L</p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[.14em] text-[var(--accent)]">Competitive profile active</p>
                          <p className="mt-1 text-sm text-white/45">Match Room and placement matchmaking arrive in the next Arena slices.</p>
                        </div>
                        <span className="rounded-full bg-white/[.05] px-3 py-2 text-[10px] font-black uppercase tracking-[.13em] text-white/40">
                          {competitiveProfile.status}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mt-7 rounded-2xl border border-white/8 bg-black/20 p-5">
                      <p className="text-xs font-black uppercase tracking-[.14em] text-[var(--accent)]">Start your competitive identity</p>
                      <p className="mt-2 text-sm leading-6 text-white/45">
                        Activating creates a clean, game-specific record at the default rating. It does not create a wallet, entry fee, prize balance or cash eligibility.
                      </p>
                    </div>

                    <form action={activateCompetitiveProfile} className="mt-5">
                      <input type="hidden" name="gameSlug" value={game.slug} />
                      <button
                        type="submit"
                        className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-black text-[var(--accent-ink)] transition hover:brightness-105"
                      >
                        Activate {game.short_name ?? game.name}
                      </button>
                    </form>
                  </>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  {config.ranked_enabled ? (
                    <span className="rounded-full border border-white/8 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-white/35">Free ranked planned</span>
                  ) : null}
                  {config.supported_modes.map((mode: string) => (
                    <span key={mode} className="rounded-full border border-white/8 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-white/35">
                      {mode.replaceAll('-', ' ')}
                    </span>
                  ))}
                  <span className="rounded-full border border-white/8 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-white/35">
                    {config.verification_method.replaceAll('_', ' ')}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-white/8 bg-[#0e1218] p-6">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[var(--accent)]">01 · Identity</p>
          <h2 className="mt-3 text-xl font-black">Separate football records.</h2>
          <p className="mt-2 text-sm leading-6 text-white/45">FC 26 and eFootball never share a skill rating. One Mechi ID, two competitive careers.</p>
        </article>
        <article className="rounded-3xl border border-white/8 bg-[#0e1218] p-6">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[var(--accent)]">02 · Competition</p>
          <h2 className="mt-3 text-xl font-black">Free Ranked first.</h2>
          <p className="mt-2 text-sm leading-6 text-white/45">Placement matches, Match Room, result agreement and disputes come before any player-funded competition.</p>
        </article>
        <article className="rounded-3xl border border-white/8 bg-[#0e1218] p-6">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[var(--accent)]">03 · Trust</p>
          <h2 className="mt-3 text-xl font-black">Cash stays gated.</h2>
          <p className="mt-2 text-sm leading-6 text-white/45">The database config keeps cash disabled by default. Financial enablement is a later explicit policy decision.</p>
        </article>
      </div>
    </section>
  );
}
