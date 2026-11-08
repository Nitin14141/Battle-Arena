import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell flex min-h-[70vh] items-center justify-center px-5">
      <div className="text-center">
        <p className="font-mono text-sm uppercase tracking-[0.4em] text-arena-purple">404</p>
        <h1 className="mt-3 font-display text-4xl font-black text-white">SECTOR NOT FOUND</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-arena-text2">
          This arena does not exist, or the fighter you were looking for is no longer on the roster.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-gradient-to-r from-arena-purple to-arena-blue px-6 py-3 text-xs font-bold uppercase tracking-widest text-white"
          >
            Back to arena
          </Link>
          <Link
            href="/character-explorer"
            className="rounded-full border border-arena-border px-6 py-3 text-xs font-bold uppercase tracking-widest text-arena-text2 hover:text-white"
          >
            Browse roster
          </Link>
        </div>
      </div>
    </main>
  );
}
