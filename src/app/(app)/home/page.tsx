const modules = [
  ['Your Mechi', 'Profile completion, views and sharing live here.'],
  ['People worth meeting', 'Recommendations will be based on games, platform and location.'],
  ['What changed', 'Only meaningful identity activity — no generic social feed.'],
];

export default function HomePage() {
  return (
    <section>
      <p className="text-sm font-bold text-[var(--accent)]">HOME</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-.045em]">Your gaming world, without the noise.</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {modules.map(([title, copy]) => (
          <article key={title} className="min-h-48 rounded-3xl border border-white/8 bg-[#0e1218] p-6">
            <h2 className="text-lg font-black">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/50">{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
