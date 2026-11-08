export default function TermsPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-arena-purple">Terms</p>
        <h1 className="mt-3 font-display text-4xl font-black text-white">TERMS &amp; CONDITIONS</h1>
        <p className="mt-2 text-xs text-arena-text3">Last updated: 7 November 2026 · Guest-mode build</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-arena-text2">
          <section>
            <h2 className="font-display text-xl font-bold text-white">1. Entertainment only</h2>
            <p className="mt-2">
              Battle Arena produces hypothetical simulations for entertainment and discussion. Results
              are not factual claims about any character, person or historical event.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white">2. Fictional and historical content</h2>
            <p className="mt-2">
              Fictional characters remain the property of their respective rights holders. Historical
              fighters are deceased figures only. Profiles are limited to documented capabilities and
              exclude living individuals.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white">3. Simulation limits</h2>
            <p className="mt-2">
              Attributes are curated estimates on a 0–100 scale. Different reasonable estimates can
              change an outcome. The stored seed reproduces a run, but it does not make the underlying
              estimate objectively correct.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white">4. Acceptable use</h2>
            <p className="mt-2">
              Do not use the service to harass people, to attempt prompt injection against the AI
              layer, to overload the API, or to present simulated results as real-world predictions
              about living people.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white">5. No warranty</h2>
            <p className="mt-2">
              The service is provided as-is during development. Features may change, saved local
              results may be cleared, and no availability guarantee is made.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
