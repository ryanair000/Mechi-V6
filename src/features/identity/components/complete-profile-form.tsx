'use client';

import { useActionState } from 'react';
import { completeProfile, type CompleteProfileState } from '@/features/identity/actions';

type GameOption = {
  id: string;
  name: string;
  short_name: string | null;
};

type PlatformOption = {
  id: string;
  name: string;
};

type ProfileDefaults = {
  displayName: string;
  bio: string;
  countryCode: string;
  city: string;
  gamingStyles: string[];
  gameIds: string[];
  platformIds: string[];
};

const initialState: CompleteProfileState = {};

const STYLE_OPTIONS = [
  ['competitive', 'Competitive'],
  ['casual', 'Casual'],
  ['chill', 'Chill'],
  ['ranked-grinder', 'Ranked Grinder'],
  ['weekend-gamer', 'Weekend Gamer'],
  ['content-creator', 'Content Creator'],
  ['esports', 'Esports'],
  ['sports-games', 'Sports Games'],
  ['fps', 'FPS'],
  ['racing', 'Racing'],
  ['fighting-games', 'Fighting Games'],
  ['rpg', 'RPG'],
] as const;

export function CompleteProfileForm({
  profile,
  games,
  platforms,
}: {
  profile: ProfileDefaults;
  games: GameOption[];
  platforms: PlatformOption[];
}) {
  const [state, formAction, pending] = useActionState(completeProfile, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-10">
      <section className="space-y-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--accent)]">Identity</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight">Make it yours.</h2>
        </div>

        <label className="block">
          <span className="text-xs font-black uppercase tracking-[.14em] text-white/40">Display name</span>
          <input
            name="displayName"
            required
            maxLength={60}
            defaultValue={profile.displayName}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3.5 outline-none transition focus:border-[var(--accent)]/60"
          />
        </label>

        <label className="block">
          <span className="flex items-center justify-between text-xs font-black uppercase tracking-[.14em] text-white/40">
            <span>Gamer bio</span>
            <span className="normal-case tracking-normal text-white/25">160 max</span>
          </span>
          <textarea
            name="bio"
            maxLength={160}
            rows={3}
            defaultValue={profile.bio}
            placeholder="FC sweat. Racing addict. Casual everywhere else."
            className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3.5 outline-none transition focus:border-[var(--accent)]/60"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[.14em] text-white/40">Country</span>
            <input
              name="countryCode"
              maxLength={2}
              defaultValue={profile.countryCode || 'KE'}
              placeholder="KE"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3.5 uppercase outline-none transition focus:border-[var(--accent)]/60"
            />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[.14em] text-white/40">City</span>
            <input
              name="city"
              maxLength={80}
              defaultValue={profile.city}
              placeholder="Nairobi"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3.5 outline-none transition focus:border-[var(--accent)]/60"
            />
          </label>
        </div>
      </section>

      <fieldset>
        <legend className="text-xs font-black uppercase tracking-[.18em] text-[var(--accent)]">Gamer style</legend>
        <p className="mt-2 text-sm text-white/45">Choose up to three tags that actually describe you.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {STYLE_OPTIONS.map(([value, label]) => (
            <label key={value} className="cursor-pointer">
              <input
                type="checkbox"
                name="gamingStyles"
                value={value}
                defaultChecked={profile.gamingStyles.includes(value)}
                className="peer sr-only"
              />
              <span className="block rounded-full border border-white/10 bg-white/[.035] px-4 py-2.5 text-sm font-bold text-white/55 transition peer-checked:border-[var(--accent)]/60 peer-checked:bg-[var(--accent)]/10 peer-checked:text-[var(--accent)]">
                {label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-black uppercase tracking-[.18em] text-[var(--accent)]">Your games</legend>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-white/45">Pick 2–10. Your first selection becomes your primary game.</p>
          <span className="text-xs font-bold text-white/25">{games.length} available</span>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {games.map((game) => (
            <label key={game.id} className="cursor-pointer">
              <input
                type="checkbox"
                name="gameIds"
                value={game.id}
                defaultChecked={profile.gameIds.includes(game.id)}
                className="peer sr-only"
              />
              <span className="flex min-h-16 items-center justify-between rounded-2xl border border-white/8 bg-white/[.03] px-4 py-3 transition peer-checked:border-[var(--accent)]/55 peer-checked:bg-[var(--accent)]/[.08]">
                <span>
                  <span className="block text-sm font-black">{game.short_name || game.name}</span>
                  {game.short_name && game.short_name !== game.name ? (
                    <span className="mt-0.5 block text-xs text-white/30">{game.name}</span>
                  ) : null}
                </span>
                <span className="size-3 rounded-full border border-white/20 peer-checked:bg-[var(--accent)]" />
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-black uppercase tracking-[.18em] text-[var(--accent)]">Platforms</legend>
        <p className="mt-2 text-sm text-white/45">Choose 1–4 places you actually play.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {platforms.map((platform) => (
            <label key={platform.id} className="cursor-pointer">
              <input
                type="checkbox"
                name="platformIds"
                value={platform.id}
                defaultChecked={profile.platformIds.includes(platform.id)}
                className="peer sr-only"
              />
              <span className="block rounded-2xl border border-white/8 bg-white/[.03] px-4 py-3.5 text-sm font-bold text-white/60 transition peer-checked:border-[var(--accent)]/55 peer-checked:bg-[var(--accent)]/[.08] peer-checked:text-white">
                {platform.name}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {state.error ? (
        <p role="alert" className="rounded-2xl border border-red-400/20 bg-red-400/[.07] px-4 py-3 text-sm leading-6 text-red-100">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-[var(--accent)] px-5 py-4 text-sm font-black text-[var(--accent-ink)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? 'Building your Mechi…' : 'Publish my Mechi'}
      </button>
    </form>
  );
}
