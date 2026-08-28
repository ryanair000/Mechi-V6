export function DemoCard() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1117] p-5 shadow-2xl shadow-black/40">
      <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_70%_20%,rgba(184,255,44,.3),transparent_45%),linear-gradient(120deg,#1d2531,#0d1117)]" />
      <div className="relative pt-14">
        <div className="grid size-24 place-items-center rounded-3xl border-4 border-[#0d1117] bg-[#202937] text-3xl font-black">R</div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-2xl font-black tracking-tight">RYAN</p>
            <p className="text-sm text-white/55">@ryan · Nairobi, Kenya</p>
          </div>
          <span className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-xs font-bold text-[var(--accent)]">PS5</span>
        </div>
        <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">FC sweat. Racing addict. Casual everywhere else.</p>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {['FC 26', 'eFootball', 'F1 26', 'COD'].map((game) => (
            <div key={game} className="rounded-2xl border border-white/8 bg-white/[.035] px-3 py-4 text-center text-xs font-bold">{game}</div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-white/8 pt-4 text-xs text-white/45">
          <span>Competitive · Weekend Gamer</span>
          <span className="font-bold text-white/80">mechi/@ryan</span>
        </div>
      </div>
    </div>
  );
}
