"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/battle-setup", label: "Fight" },
  { href: "/character-explorer", label: "Roster" },
  { href: "/research", label: "Research" },
  { href: "/trending", label: "Trending" },
  { href: "/battle-history", label: "History" },
  { href: "/community", label: "Community" },
  { href: "/tournament", label: "Tournament" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="sticky top-0 z-50 border-b border-arena-border/50 bg-[#05050b]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-arena-purple to-arena-blue text-lg shadow-glow">
            ⚡
          </span>
          <span className="font-display text-lg font-extrabold tracking-[0.18em] text-white sm:text-xl">
            BATTLE <span className="gradient-text">ARENA</span>
          </span>
        </Link>

        <div className="hidden items-center gap-4 lg:flex xl:gap-6">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative py-1 text-[13px] font-semibold transition-colors xl:text-sm ${
                isActive(link.href) ? "text-arena-blue" : "text-arena-text2 hover:text-white"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full bg-gradient-to-r from-arena-purple to-arena-blue" />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="hidden rounded-full border border-arena-border px-4 py-2 text-xs font-bold uppercase tracking-widest text-arena-text2 transition-colors hover:border-arena-blue hover:text-white sm:block"
          >
            Profile
          </Link>
          <Link
            href="/battle-setup"
            className="rounded-full bg-gradient-to-r from-arena-purple to-arena-blue px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-glow transition-transform hover:scale-105"
          >
            Enter Arena
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Toggle navigation"
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg border border-arena-border text-arena-text2 lg:hidden"
          >
            <span className="text-lg">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-arena-border/50 bg-[#05050b] px-5 py-4 lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${
                  isActive(link.href)
                    ? "border-arena-blue/50 bg-arena-blue/10 text-arena-blue"
                    : "border-arena-border/60 text-arena-text2"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-arena-border/60 px-3 py-2.5 text-sm font-semibold text-arena-text2"
            >
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
