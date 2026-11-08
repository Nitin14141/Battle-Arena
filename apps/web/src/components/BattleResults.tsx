"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  BattleMode,
  BattleRunResult,
  CharacterProfile,
  ModeBattleResult,
} from "@battle-arena/shared";
import { CharacterEmblem } from "@/components/CharacterEmblem";
import { ArenaImage } from "@/components/ui/ArenaImage";
import { arenaImageFor } from "@/lib/images";

const MODE_META: Record<BattleMode, { label: string; tagline: string; text: string; bar: string }> = {
  intelligence: {
    label: "Intelligence",
    tagline: "Strategy, prediction and adaptation",
    text: "text-arena-blue",
    bar: "from-arena-blue to-arena-cyan",
  },
  strength: {
    label: "Strength",
    tagline: "Power, speed and durability",
    text: "text-arena-red",
    bar: "from-arena-orange to-arena-red",
  },
  overall: {
    label: "Overall",
    tagline: "Every capability interacting at once",
    text: "text-arena-purple",
    bar: "from-arena-purple to-arena-blue",
  },
};

function outcomeText(mode: ModeBattleResult): string {
  switch (mode.overall.winner) {
    case "a_wins":
      return `${mode.characterA.name} wins`;
    case "b_wins":
      return `${mode.characterB.name} wins`;
    case "inconclusive":
      return "Inconclusive";
    default:
      return "Draw";
  }
}

function winnerTone(mode: ModeBattleResult): string {
  if (mode.overall.winner === "a_wins") return "text-arena-purple";
  if (mode.overall.winner === "b_wins") return "text-arena-blue";
  return "text-arena-gold";
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function radarAxes(character: CharacterProfile) {
  return [
    average([character.intelligence.strategic, character.intelligence.tactical]),
    character.intelligence.adaptability,
    character.intelligence.experience,
    average([character.combat.strength, character.combat.attackPower]),
    average([character.combat.speed, character.combat.reactionSpeed]),
    average([character.combat.durability, character.combat.defence]),
  ];
}

const AXIS_LABELS = ["Strategy", "Adapt", "Experience", "Power", "Speed", "Durability"];

function Radar({ a, b }: { a: CharacterProfile; b: CharacterProfile }) {
  const size = 280;
  const center = size / 2;
  const radius = 96;
  const aValues = radarAxes(a);
  const bValues = radarAxes(b);

  const angleFor = (index: number) => -Math.PI / 2 + (index * 2 * Math.PI) / AXIS_LABELS.length;

  const point = (index: number, value: number) => {
    const distance = radius * (Math.max(0, Math.min(100, value)) / 100);
    return [center + Math.cos(angleFor(index)) * distance, center + Math.sin(angleFor(index)) * distance];
  };

  const polygon = (values: number[]) =>
    values.map((value, index) => point(index, value).join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-64 w-full max-w-xs" role="img" aria-label="Attribute comparison radar">
      {[0.25, 0.5, 0.75, 1].map((ring) => (
        <polygon
          key={ring}
          points={AXIS_LABELS.map((_, index) => point(index, ring * 100).join(",")).join(" ")}
          fill="none"
          stroke="rgba(148,163,184,0.18)"
          strokeWidth="1"
        />
      ))}
      {AXIS_LABELS.map((label, index) => {
        const [x, y] = point(index, 100);
        return (
          <g key={label}>
            <line x1={center} y1={center} x2={x} y2={y} stroke="rgba(148,163,184,0.14)" strokeWidth="1" />
            <text
              x={center + Math.cos(angleFor(index)) * (radius + 20)}
              y={center + Math.sin(angleFor(index)) * (radius + 20)}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-arena-text3"
              style={{ fontSize: 8, letterSpacing: 0.6, textTransform: "uppercase" }}
            >
              {label}
            </text>
          </g>
        );
      })}
      <polygon points={polygon(aValues)} fill="rgba(176,38,255,0.22)" stroke="#b026ff" strokeWidth="2" />
      <polygon points={polygon(bValues)} fill="rgba(0,212,255,0.18)" stroke="#00d4ff" strokeWidth="2" />
    </svg>
  );
}

function TallyGrid({ mode }: { mode: ModeBattleResult }) {
  const cells = [
    { label: mode.characterA.name, value: mode.overall.aWins, tone: "text-arena-purple" },
    { label: mode.characterB.name, value: mode.overall.bWins, tone: "text-arena-blue" },
    { label: "Draws", value: mode.overall.draws, tone: "text-arena-text2" },
    { label: "Inconclusive", value: mode.overall.inconclusive, tone: "text-arena-gold" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cells.map((cell) => (
        <div key={cell.label} className="rounded-2xl border border-arena-border/50 bg-black/30 p-4 text-center">
          <p className={`font-mono text-3xl font-black ${cell.tone}`}>{cell.value}</p>
          <p className="mt-1 truncate text-[10px] uppercase tracking-widest text-arena-text3">{cell.label}</p>
        </div>
      ))}
    </div>
  );
}

function TrialStrip({ mode, index }: { mode: ModeBattleResult; index: number }) {
  const scenario = mode.scenarioResults[index];
  if (!scenario) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {scenario.trials.map((trial) => (
        <span
          key={trial.trialIndex}
          title={`Trial ${trial.trialIndex}: ${trial.outcome} (${trial.aScore}–${trial.bScore})`}
          className={`h-3 w-3 rounded-sm ${
            trial.outcome === "a_wins"
              ? "bg-arena-purple"
              : trial.outcome === "b_wins"
                ? "bg-arena-blue"
                : trial.outcome === "draw"
                  ? "bg-arena-text3"
                  : "bg-arena-gold"
          }`}
        />
      ))}
    </div>
  );
}

export function BattleResults({ result }: { result: BattleRunResult }) {
  const [activeMode, setActiveMode] = useState<BattleMode>(result.modes[0]?.mode ?? "overall");
  const [copied, setCopied] = useState(false);

  const mode = result.modes.find((entry) => entry.mode === activeMode) ?? result.modes[0];
  if (!mode) return null;

  const meta = MODE_META[mode.mode];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/battle-results?run=${result.runId}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${result.runId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Winner banner */}
      <section className="relative overflow-hidden rounded-3xl border border-arena-border/60 bg-arena-surface/60">
        <ArenaImage
          src={arenaImageFor(`${result.characterA.id}${result.characterB.id}`)}
          alt="Arena backdrop"
          className="absolute inset-0 h-full w-full opacity-30"
          sizes="100vw"
          overlay
        />
        <div className="relative grid gap-6 p-6 sm:p-10 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <div className="flex items-center gap-4 lg:flex-row-reverse lg:text-right">
            <CharacterEmblem name={result.characterA.name} theme={result.characterA.theme} size="xl" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-arena-purple">Fighter A</p>
              <h2 className="font-display text-2xl font-black text-white sm:text-3xl">{result.characterA.name}</h2>
              <p className="text-sm text-arena-text2">{result.characterA.universe}</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-arena-text3">Winner</p>
            <p className={`font-display text-xl font-black sm:text-2xl ${winnerTone(mode)}`}>{outcomeText(mode)}</p>
            <p className="mt-1 font-mono text-xs text-arena-text3">
              {mode.overall.aWins}–{mode.overall.bWins} · {mode.overall.totalTrials} trials
            </p>
          </div>

          <div className="flex items-center gap-4">
            <CharacterEmblem name={result.characterB.name} theme={result.characterB.theme} size="xl" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-arena-blue">Fighter B</p>
              <h2 className="font-display text-2xl font-black text-white sm:text-3xl">{result.characterB.name}</h2>
              <p className="text-sm text-arena-text2">{result.characterB.universe}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mode tabs */}
      <div className="flex flex-wrap gap-2">
        {result.modes.map((entry) => (
          <button
            key={entry.mode}
            type="button"
            onClick={() => setActiveMode(entry.mode)}
            className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
              entry.mode === activeMode
                ? "border-transparent bg-gradient-to-r from-arena-purple to-arena-blue text-white"
                : "border-arena-border text-arena-text3 hover:text-white"
            }`}
          >
            {MODE_META[entry.mode].label}
          </button>
        ))}
      </div>

      {/* Overview */}
      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5 rounded-3xl border border-arena-border/60 bg-arena-surface/50 p-6">
          <div>
            <h3 className="font-display text-xl font-bold text-white">{meta.label} battle breakdown</h3>
            <p className="text-sm text-arena-text3">{meta.tagline}</p>
          </div>

          <TallyGrid mode={mode} />

          <div>
            <div className="mb-1 flex justify-between text-[11px] uppercase tracking-widest text-arena-text3">
              <span>Confidence</span>
              <span className="font-mono text-arena-text2">{mode.overall.confidence}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/50">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${meta.bar}`}
                style={{ width: `${mode.overall.confidence}%` }}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-arena-border/50 bg-black/30 p-3">
              <p className="text-[10px] uppercase tracking-widest text-arena-text3">Decisive factor</p>
              <p className="mt-1 text-sm text-arena-text2">{mode.overall.decisiveFactor}</p>
            </div>
            <div className="rounded-xl border border-arena-border/50 bg-black/30 p-3">
              <p className="text-[10px] uppercase tracking-widest text-arena-text3">Average margin</p>
              <p className="mt-1 font-mono text-sm text-arena-text2">{mode.overall.averageMargin} points</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={copyLink}
              className="rounded-lg border border-arena-border px-3 py-2 text-xs font-semibold text-arena-text2 hover:border-arena-blue hover:text-white"
            >
              {copied ? "Link copied ✓" : "Copy result link"}
            </button>
            <button
              type="button"
              onClick={downloadJson}
              className="rounded-lg border border-arena-border px-3 py-2 text-xs font-semibold text-arena-text2 hover:border-arena-purple hover:text-white"
            >
              Download JSON
            </button>
            <Link
              href="/battle-setup"
              className="rounded-lg bg-gradient-to-r from-arena-purple to-arena-blue px-3 py-2 text-xs font-bold uppercase tracking-wider text-white"
            >
              New battle
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-arena-border/60 bg-arena-surface/50 p-6">
          <div className="mb-2 flex items-center justify-between text-xs text-arena-text3">
            <span className="font-semibold uppercase tracking-widest">Attribute radar</span>
            <span className="font-mono">{result.engineVersion}</span>
          </div>
          <Radar a={result.characterA} b={result.characterB} />
          <div className="mt-2 flex items-center justify-center gap-6 text-xs text-arena-text3">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-arena-purple" /> {result.characterA.name}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-arena-blue" /> {result.characterB.name}
            </span>
          </div>
          <p className="mt-4 text-center font-mono text-[11px] text-arena-text3">
            Seed {result.seed} · {result.trialsPerScenario} trials × 10 scenarios
          </p>
        </div>
      </section>

      {/* Scenarios */}
      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h3 className="font-display text-xl font-bold text-white">Ten scenario reports</h3>
          <span className="text-xs text-arena-text3">{mode.reports.length} detailed reports</span>
        </div>

        {mode.reports.map((report, index) => {
          const scenario = mode.scenarioResults[index];
          const total = scenario?.summary.totalTrials ?? 10;
          const aShare = scenario ? (scenario.summary.aWins / total) * 100 : 0;
          const bShare = scenario ? (scenario.summary.bWins / total) * 100 : 0;

          return (
            <details
              key={report.scenarioId}
              className="group rounded-2xl border border-arena-border/60 bg-arena-surface/40 p-4 transition-colors open:border-arena-purple/40"
            >
              <summary className="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 font-mono text-xs text-arena-text2">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{report.scenarioName}</p>
                    <p className="text-[11px] text-arena-text3">
                      {scenario?.summary.aWins ?? 0}–{scenario?.summary.bWins ?? 0} · {scenario?.summary.draws ?? 0} draw ·{" "}
                      {scenario?.summary.inconclusive ?? 0} inconclusive
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrialStrip mode={mode} index={index} />
                  <span className="text-arena-text3 transition-transform group-open:rotate-180">⌄</span>
                </div>
              </summary>

              <div className="mt-4 space-y-4 border-t border-arena-border/50 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] uppercase tracking-wider text-arena-text3">
                    <span>{result.characterA.name}</span>
                    <span>{result.characterB.name}</span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-black/50">
                    <div className="h-full bg-arena-purple" style={{ width: `${aShare}%` }} />
                    <div className="h-full bg-arena-blue" style={{ width: `${bShare}%` }} />
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-arena-text2">{report.narrative}</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-arena-border/50 bg-black/30 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-arena-text3">Key factors</p>
                    <ul className="mt-1 space-y-1 text-xs text-arena-text2">
                      {report.keyFactors.map((factor) => (
                        <li key={factor}>• {factor}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-arena-border/50 bg-black/30 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-arena-text3">Turning point</p>
                    <p className="mt-1 text-xs text-arena-text2">{report.turningPoint}</p>
                    <p className="mt-2 font-mono text-[11px] text-arena-text3">
                      Average score {report.aScore}–{report.bScore}
                    </p>
                  </div>
                </div>
              </div>
            </details>
          );
        })}
      </section>

      <p className="text-center text-xs text-arena-text3">
        Reports describe engine output only. Results are saved locally in this browser (guest mode).
      </p>
    </div>
  );
}

export default BattleResults;
