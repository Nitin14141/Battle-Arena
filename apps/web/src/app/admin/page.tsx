"use client";

import { useCallback, useEffect, useState } from "react";

interface StatusPayload {
  engine: {
    version: string;
    scenarios: number;
    trialsPerScenario: number;
    totalTrialsPerMode: number;
    deterministic: boolean;
  };
  roster: {
    total: number;
    fictional: number;
    historical: number;
    universes: number;
    abilities: number;
    version: string;
  };
  ai: {
    provider: string;
    model: string;
    configured: boolean;
    freeOnlyGuard: boolean;
    note: string;
  };
  infrastructure: {
    databaseConfigured: boolean;
    redisConfigured: boolean;
    dockerAvailable: boolean;
  };
  phases: { id: string; name: string; status: string }[];
}

type Tab = "system" | "ai" | "data";

export default function AdminPage() {
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("system");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/status", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Status unavailable.");
      setStatus(payload.data as StatusPayload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Status unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-5xl px-5 pb-24 pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-arena-purple">System status</p>
            <h1 className="font-display text-3xl font-black text-white sm:text-4xl">COMMAND CENTER</h1>
            <p className="mt-1 text-xs text-arena-text3">
              Live, non-secret system information. Admin authentication arrives in Phase F.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-arena-border px-4 py-2 text-xs font-bold uppercase tracking-widest text-arena-text2 hover:border-arena-blue hover:text-white"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {error && (
          <p className="mt-6 rounded-xl border border-arena-red/30 bg-arena-red/10 px-4 py-3 text-sm text-arena-red">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-2">
          {(["system", "ai", "data"] as Tab[]).map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => setTab(entry)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                tab === entry
                  ? "bg-gradient-to-r from-arena-purple to-arena-blue text-white"
                  : "border border-arena-border text-arena-text3 hover:text-white"
              }`}
            >
              {entry}
            </button>
          ))}
        </div>

        {!status && loading && <p className="mt-8 animate-pulse text-sm text-arena-text3">Reading system state…</p>}

        {status && tab === "system" && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Card title="Simulation engine">
              <Row label="Version" value={status.engine.version} />
              <Row label="Scenarios" value={String(status.engine.scenarios)} />
              <Row label="Trials per mode" value={String(status.engine.totalTrialsPerMode)} />
              <Row label="Deterministic" value={status.engine.deterministic ? "yes" : "no"} />
            </Card>
            <Card title="Infrastructure">
              <Row label="Database" value={status.infrastructure.databaseConfigured ? "configured" : "not connected"} />
              <Row label="Redis" value={status.infrastructure.redisConfigured ? "configured" : "not connected"} />
              <Row label="Docker" value={status.infrastructure.dockerAvailable ? "available" : "not detected"} />
              <Row label="Persistence" value="guest localStorage" />
            </Card>
            <Card title="Phase roadmap" wide>
              <div className="grid gap-2 sm:grid-cols-2">
                {status.phases.map((phase) => (
                  <div
                    key={phase.id}
                    className="flex items-center justify-between rounded-lg border border-arena-border/50 bg-black/30 px-3 py-2"
                  >
                    <span className="text-xs text-arena-text2">
                      Phase {phase.id} · {phase.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        phase.status === "complete"
                          ? "text-arena-green"
                          : phase.status === "in progress"
                            ? "text-arena-gold"
                            : "text-arena-text3"
                      }`}
                    >
                      {phase.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {status && tab === "ai" && (
          <div className="mt-6 grid gap-4">
            <Card title="AI provider">
              <Row label="Provider" value={status.ai.provider} />
              <Row label="Model" value={status.ai.model} />
              <Row label="Credentials" value={status.ai.configured ? "present" : "missing"} />
              <Row label="Free-only guard" value={status.ai.freeOnlyGuard ? "enabled" : "disabled"} />
            </Card>
            <Card title="Current behaviour">
              <p className="text-sm leading-relaxed text-arena-text2">{status.ai.note}</p>
              <p className="mt-3 text-xs leading-relaxed text-arena-text3">
                Battle outcomes are always produced by the local TypeScript engine. The AI layer in
                Phase D may research profiles and narrate the result, but it is not allowed to change
                a winner, a win rate or a random seed.
              </p>
            </Card>
          </div>
        )}

        {status && tab === "data" && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Card title="Roster">
              <Row label="Version" value={status.roster.version} />
              <Row label="Total fighters" value={String(status.roster.total)} />
              <Row label="Fictional" value={String(status.roster.fictional)} />
              <Row label="Historical" value={String(status.roster.historical)} />
              <Row label="Universes" value={String(status.roster.universes)} />
              <Row label="Abilities recorded" value={String(status.roster.abilities)} />
            </Card>
            <Card title="Next data steps">
              <ul className="space-y-2 text-sm text-arena-text2">
                <li>• Move the roster into PostgreSQL and seed it.</li>
                <li>• Add research claims with source URLs and verification state.</li>
                <li>• Store battle runs, seeds and engine versions immutably.</li>
                <li>• Move community threads and votes onto the server.</li>
              </ul>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}

function Card({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section
      className={`rounded-2xl border border-arena-border/60 bg-arena-surface/40 p-5 ${wide ? "sm:col-span-2" : ""}`}
    >
      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-arena-text3">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-arena-border/30 py-1.5 text-sm last:border-0">
      <span className="text-arena-text3">{label}</span>
      <span className="font-mono text-xs text-arena-text2">{value}</span>
    </div>
  );
}
