const filters = ['Game', 'Platform', 'Country', 'City', 'Gamer style'];

export default function DiscoverPage() {
  return (
    <section>
      <p className="text-sm font-bold text-[var(--accent)]">DISCOVER</p>
      <h1 className="mt-3 text-5xl font-black tracking-[-.05em]">Find your people.</h1>
      <p className="mt-3 max-w-xl text-white/50">Search gamers, games or gamertags. Discovery stays useful even before the competitive network is dense.</p>
      <div className="mt-8 rounded-3xl border border-white/10 bg-[#0e1218] p-3">
        <input aria-label="Search gamers" placeholder="Search gamers, games or gamertags" className="w-full rounded-2xl border border-white/8 bg-black/20 px-5 py-4 text-base outline-none placeholder:text-white/30 focus:border-[var(--accent)]/50" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((filter) => <button key={filter} className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white/60 hover:text-white">{filter}</button>)}
      </div>
      <div className="mt-10 rounded-3xl border border-dashed border-white/10 p-10 text-center text-sm text-white/40">Gamer results land here in Sprint 5.</div>
    </section>
  );
}
