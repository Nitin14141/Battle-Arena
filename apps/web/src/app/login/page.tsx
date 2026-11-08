import Link from "next/link";

const READY = [
  "Run deterministic battles in all three modes",
  "Browse 44 fictional and historical fighters",
  "Keep up to eight battle results in this browser",
  "Run eight-fighter tournament brackets",
];

const LATER = [
  "Account sign-in and cloud profiles",
  "Community posting, voting and live trending",
  "Server-side battle history and sharing across devices",
  "Admin research verification workflow",
];

export default function LoginPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-16">
        <div className="rounded-3xl border border-arena-purple/25 bg-arena-surface/50 p-8 text-center shadow-glow">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-arena-purple to-arena-blue text-2xl shadow-glow">
            ⚡
          </div>
          <h1 className="mt-5 font-display text-3xl font-black text-white">ACCOUNTS ARE PHASE E</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-arena-text2">
            The fake magic-link form has been removed. Sign-in is deliberately not shipped until the
            database and auth flow are real, so nothing here can silently fail.
          </p>

          <div className="mt-7 grid gap-4 text-left sm:grid-cols-2">
            <div className="rounded-2xl border border-arena-green/25 bg-arena-green/5 p-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-arena-green">Available now</h2>
              <ul className="mt-2 space-y-1.5 text-xs text-arena-text2">
                {READY.map((item) => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-arena-border bg-black/30 p-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-arena-text3">Arrives in Phase E</h2>
              <ul className="mt-2 space-y-1.5 text-xs text-arena-text2">
                {LATER.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/battle-setup"
              className="rounded-full bg-gradient-to-r from-arena-purple to-arena-blue px-6 py-3 text-xs font-bold uppercase tracking-widest text-white"
            >
              Continue as guest
            </Link>
            <Link
              href="/"
              className="rounded-full border border-arena-border px-6 py-3 text-xs font-bold uppercase tracking-widest text-arena-text2 hover:text-white"
            >
              Back home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
