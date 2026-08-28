import Link from 'next/link';

export default function MePage() {
  return (
    <section className="max-w-3xl">
      <p className="text-sm font-bold text-[var(--accent)]">MECHI ID</p>
      <h1 className="mt-3 text-5xl font-black tracking-[-.05em]">Claim the identity first.</h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-white/55">Sprint 1 turns this into the authentication + handle-claiming flow. The route exists now so the product architecture remains stable as features arrive.</p>
      <div className="mt-8 rounded-3xl border border-white/8 bg-[#0e1218] p-6">
        <label className="text-xs font-black uppercase tracking-[.18em] text-white/45" htmlFor="handle">Your Mechi ID</label>
        <div className="mt-3 flex rounded-2xl border border-white/10 bg-black/20 p-1.5">
          <span className="px-3 py-3 text-sm text-white/35">mechi.gg/@</span>
          <input id="handle" disabled placeholder="yourhandle" className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-white/20" />
          <button disabled className="rounded-xl bg-white/10 px-4 text-sm font-black text-white/35">Coming Sprint 1</button>
        </div>
      </div>
      <Link href="/" className="mt-6 inline-block text-sm font-bold text-white/50 hover:text-white">← Back to V6 foundation</Link>
    </section>
  );
}
