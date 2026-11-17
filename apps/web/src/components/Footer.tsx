import Link from "next/link";

const COLUMNS = [
  {
    title: "Arena",
    links: [
      { href: "/battle-setup", label: "Start a battle" },
      { href: "/character-explorer", label: "Character roster" },
      { href: "/trending", label: "Trending matchups" },
      { href: "/tournament", label: "Tournament" },
    ],
  },
  {
    title: "Records",
    links: [
      { href: "/battle-history", label: "Battle history" },
      { href: "/profile", label: "Guest profile" },
      { href: "/community", label: "Community" },
      { href: "/admin", label: "System status" },
    ],
  },
  {
    title: "Project",
    links: [
      { href: "/about", label: "About" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms & conditions" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-16 border-t border-arena-border/40 bg-black/40 sm:mt-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-arena-purple to-arena-blue text-lg">
              ⚡
            </span>
            <span className="font-display text-lg font-extrabold tracking-[0.18em] text-white">
              BATTLE <span className="gradient-text">ARENA</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-arena-text3">
            Every Universe. Every Legend. One Battlefield. Deterministic simulations, transparent
            scoring and reports you can reproduce from the stored seed.
          </p>
          <p className="mt-4 text-xs leading-relaxed text-arena-text3/80">
            All battles are hypothetical and non-graphic. Fictional profiles use canon; real-person
            profiles use publicly documented information and are not real-world predictions.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-arena-text2">
              {column.title}
            </h3>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-arena-text3 transition-colors hover:text-arena-blue"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-arena-border/30 px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-xs text-arena-text3 sm:flex-row">
          <span>© {new Date().getFullYear()} Battle Arena. Guest mode — accounts arrive in Phase E.</span>
          <span className="font-mono">Engine 0.2.0 · 10 scenarios × 10 trials</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
