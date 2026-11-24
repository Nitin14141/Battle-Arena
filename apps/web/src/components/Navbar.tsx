"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AudioToggle } from "@/components/AudioToggle";

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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5">
        <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-2 sm:gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-arena-purple to-arena-blue text-base shadow-glow sm:h-9 sm:w-9 sm:text-lg">
            ⚡
          </span>
          <span className="whitespace-nowrap font-display text-base font-extrabold tracking-[0.16em] text-white sm:text-xl sm:tracking-[0.18em]">
            BATTLE <span className="gradient-text">ARENA</span>
          </span>
        </Link>

        <div className="hidden items-center gap-4 xl:flex xl:gap-6">
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

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <AudioToggle />
          <Link
            href="/profile"
            className="hidden rounded-full border border-arena-border px-4 py-2 text-xs font-bold uppercase tracking-widest text-arena-text2 transition-colors hover:border-arena-blue hover:text-white sm:block"
          >
            Profile
          </Link>
          <Link
            href="/battle-setup"
            className="hidden rounded-full bg-gradient-to-r from-arena-purple to-arena-blue px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-glow transition-transform hover:scale-105 sm:inline-flex"
          >
            Enter Arena
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Toggle navigation"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-arena-border text-arena-text2 xl:hidden"
          >
            <span className="text-lg">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-arena-border/50 bg-[#05050b] px-5 py-4 xl:hidden">
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
