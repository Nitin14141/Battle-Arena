export default function PrivacyPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-arena-blue">Privacy</p>
        <h1 className="mt-3 font-display text-4xl font-black text-white">PRIVACY POLICY</h1>
        <p className="mt-2 text-xs text-arena-text3">Last updated: 7 November 2026 · Guest-mode build</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-arena-text2">
          <section>
            <h2 className="font-display text-xl font-bold text-white">What we store right now</h2>
            <p className="mt-2">
              This build has no accounts and no server database. Battle results, your display name and
              your history are stored in your own browser using localStorage and sessionStorage. They
              never leave your device and are removed when you clear site data.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white">Server requests</h2>
            <p className="mt-2">
              Running a battle sends only the two fighter IDs, selected modes and a seed to this
              application&apos;s API. No account identifier or personal detail is required.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white">AI providers</h2>
            <p className="mt-2">
              When the AI layer is enabled, character research and narration may be sent to the
              configured model provider. API keys stay on the server and are never sent to the
              browser. The current build makes no AI requests during a battle.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white">Your controls</h2>
            <p className="mt-2">
              You can delete individual results or clear all saved data from the Profile and Battle
              History pages at any time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white">Future changes</h2>
            <p className="mt-2">
              When accounts, server-side history and community features are added, this policy will be
              updated before those features are enabled.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
