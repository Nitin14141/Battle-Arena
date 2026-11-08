import type {
  BattleMode,
  CharacterProfile,
  ScenarioReport,
  ScenarioResult,
} from "@battle-arena/shared";

export const REPORT_ENGINE_VERSION = "0.2.0";

const MODE_LABEL: Record<BattleMode, string> = {
  intelligence: "intelligence",
  strength: "strength",
  overall: "overall",
};

const TURNING_POINTS: Record<BattleMode, string[]> = {
  intelligence: [
    "a feint that forced the opponent to commit first",
    "a mid-fight change of plan that collapsed the opposing strategy",
    "control of the terrain that removed the opponent's preferred opening",
    "a read on the opponent's habits that turned patience into an ambush",
    "resource denial that left the opponent improvising",
  ],
  strength: [
    "a single exchange that broke the opponent's guard",
    "a speed burst that landed before the opponent could brace",
    "a durability check the opponent could not survive twice",
    "a weapon clash that stripped the opponent's reach advantage",
    "an endurance push after both fighters had spent their best attacks",
  ],
  overall: [
    "a strategic setup that made raw power land cleanly",
    "an ability interaction that neutralised the opponent's best tool",
    "a shift from defence to counterattack at the exact right moment",
    "preparation that turned a physical mismatch into a manageable fight",
    "an adaptation that closed a gap the opponent never expected to lose",
  ],
};

const SCENARIO_TACTICS: Record<string, string> = {
  standard_battle: "Both fighters opened with their standard doctrine and no unusual advantages.",
  max_power: "Both sides escalated toward their highest eligible output, which shortened exchanges and raised the cost of every mistake.",
  no_preparation: "Neither fighter had time to plan, so instinct and reaction speed carried more weight than prepared strategy.",
  full_preparation: "Both sides arrived prepared, which rewarded planning depth and punished predictable openings.",
  full_knowledge: "Each fighter knew the other's full toolkit, so deception and prediction decided who landed the decisive sequence.",
  limited_equipment: "Restricted gear stripped away crutches and forced both fighters to rely on innate capability.",
  full_equipment: "Full arsenals were available, so equipment synergy and counters mattered as much as raw attributes.",
  unfamiliar_environment: "An unknown battlefield punished rigid fighters and rewarded whoever adapted fastest.",
  tactical_challenge: "The objective was multi-stage, so battlefield control and resource management outweighed raw damage.",
  randomized_conditions: "Conditions shifted unpredictably, producing a wider spread of outcomes across the trials.",
};

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function topFactors(scenario: ScenarioResult): string[] {
  const counts = new Map<string, number>();
  for (const trial of scenario.trials) {
    for (const factor of trial.decisiveFactors) {
      counts.set(factor, (counts.get(factor) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([factor]) => factor);
}

function winnerName(scenario: ScenarioResult, a: CharacterProfile, b: CharacterProfile): string | null {
  if (scenario.summary.aWins > scenario.summary.bWins) return a.name;
  if (scenario.summary.bWins > scenario.summary.aWins) return b.name;
  return null;
}

/**
 * Builds the ten human-readable reports from simulation output.
 *
 * This is deliberately deterministic: the narrative describes the numbers the
 * engine produced. AI narration is layered on top later and may never change
 * the winner or the win rates.
 */
export function buildScenarioReports(
  mode: BattleMode,
  scenarioResults: ScenarioResult[],
  characterA: CharacterProfile,
  characterB: CharacterProfile,
  seed: number,
): ScenarioReport[] {
  return scenarioResults.map((scenario, index) => {
    const winner = winnerName(scenario, characterA, characterB);
    const aScore = Math.round(average(scenario.trials.map((t) => t.aScore)));
    const bScore = Math.round(average(scenario.trials.map((t) => t.bScore)));
    const margin = Math.abs(aScore - bScore);
    const factors = topFactors(scenario);
    const tactic = SCENARIO_TACTICS[scenario.scenarioId] ?? "Conditions were applied as configured.";
    const turningPoints = TURNING_POINTS[mode];
    const turningPoint = turningPoints[(index + seed) % turningPoints.length];

    const headline = winner
      ? `${winner} takes ${scenario.scenarioName}`
      : `No clean winner in ${scenario.scenarioName}`;

    const tally = `${scenario.summary.aWins}-${scenario.summary.bWins} with ${scenario.summary.draws} draw(s) and ${scenario.summary.inconclusive} inconclusive result(s)`;

    const narrative = winner
      ? `${tactic} Across ten ${MODE_LABEL[mode]} trials the scenario split ${tally}. ${winner} finished with an average score of ${Math.max(aScore, bScore)} against ${Math.min(aScore, bScore)}, a margin of ${margin} points. The result was decided by ${turningPoint}, with ${factors[0] ?? "the stronger attribute profile"} recurring as the main separator.`
      : `${tactic} The trials split ${tally}, and the average scores (${aScore} to ${bScore}) stayed inside the noise band. No side demonstrated a repeatable advantage, so this scenario is recorded without a winner rather than forced to one.`;

    return {
      scenarioId: scenario.scenarioId,
      scenarioName: scenario.scenarioName,
      headline,
      narrative,
      keyFactors: factors.length > 0 ? factors : ["Attributes were too close to separate"],
      turningPoint,
      aScore,
      bScore,
    };
  });
}
