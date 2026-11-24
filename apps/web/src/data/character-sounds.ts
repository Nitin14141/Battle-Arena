/**
 * Per-fighter audio identity: a short signature sting plus the line the fighter
 * says when the arena declares them the winner.
 *
 * Quotes are short, widely quoted lines shown as text and spoken by the
 * browser's own speech voice. No actor recordings or copyrighted voice clips
 * are stored or fetched — the sting is synthesised in the browser from the
 * configuration below, so every fighter sounds different without shipping any
 * audio files or depending on a sample CDN staying online.
 */
export interface CharacterSound {
  /** Victory line shown on the results screen and spoken as text. */
  quote: string | null;
  /** Speech tuning: 1 is the browser default. */
  voice: { pitch: number; rate: number };
  /** Signature sting, synthesised with Web Audio. */
  sting: {
    wave: OscillatorType;
    /** Frequency in Hz of the first note. */
    base: number;
    /** Semitone offsets, played in order. */
    motif: number[];
    /** Seconds each note rings for. */
    decay: number;
  };
}

export const CHARACTER_SOUNDS: Record<string, CharacterSound> = {
  "gojo-satoru": {
    quote: "Throughout heaven and earth, I alone am the honoured one.",
    voice: { pitch: 1.05, rate: 1.02 },
    sting: { wave: "sawtooth", base: 392, motif: [0, 7, 12, -5], decay: 0.22 },
  },
  "ryomen-sukuna": {
    quote: "Know your place, fool.",
    voice: { pitch: 0.72, rate: 0.92 },
    sting: { wave: "sawtooth", base: 196, motif: [0, -2, -5, -12, -5], decay: 0.3 },
  },
  "naruto-uzumaki": {
    quote: "I never go back on my word. That's my ninja way!",
    voice: { pitch: 1.15, rate: 1.1 },
    sting: { wave: "square", base: 440, motif: [0, 7, 12, 16], decay: 0.16 },
  },
  "sasuke-uchiha": {
    quote: "My only goal lies in the darkness.",
    voice: { pitch: 0.95, rate: 1.0 },
    sting: { wave: "triangle", base: 330, motif: [0, 3, 7, 3], decay: 0.18 },
  },
  "monkey-d-luffy": {
    quote: "I'm gonna be King of the Pirates!",
    voice: { pitch: 1.25, rate: 1.12 },
    sting: { wave: "square", base: 523, motif: [0, 4, 7, 12, 7], decay: 0.14 },
  },
  "roronoa-zoro": {
    quote: "Nothing happened.",
    voice: { pitch: 0.9, rate: 0.98 },
    sting: { wave: "sawtooth", base: 262, motif: [0, -1, 7, 5], decay: 0.22 },
  },
  goku: {
    quote: "I am the hope of the universe!",
    voice: { pitch: 1.1, rate: 1.05 },
    sting: { wave: "square", base: 494, motif: [0, 7, 12, 19], decay: 0.15 },
  },
  vegeta: {
    quote: "I am the prince of all Saiyans!",
    voice: { pitch: 1.0, rate: 1.02 },
    sting: { wave: "sawtooth", base: 349, motif: [0, 5, 12, 10], decay: 0.17 },
  },
  saitama: {
    quote: "One punch is all I need. Okay?",
    voice: { pitch: 0.85, rate: 0.86 },
    sting: { wave: "sine", base: 220, motif: [0, 0, 7], decay: 0.28 },
  },
  "light-yagami": {
    quote: "I am justice, and I will reign over the new world.",
    voice: { pitch: 1.08, rate: 0.95 },
    sting: { wave: "triangle", base: 466, motif: [0, -1, -3, -8], decay: 0.24 },
  },
  "lelouch-lamperouge": {
    quote: "I, Lelouch vi Britannia, command you: obey me!",
    voice: { pitch: 0.92, rate: 0.94 },
    sting: { wave: "square", base: 311, motif: [0, -4, -7, -12], decay: 0.26 },
  },
  "eren-yeager": {
    quote: "I will keep moving forward, until my enemies are destroyed.",
    voice: { pitch: 0.88, rate: 1.0 },
    sting: { wave: "sawtooth", base: 233, motif: [0, 3, 6, 9], decay: 0.2 },
  },
  "levi-ackerman": {
    quote: "No regrets. Make the choice you won't regret.",
    voice: { pitch: 0.9, rate: 1.06 },
    sting: { wave: "triangle", base: 415, motif: [0, 5, 7, 12], decay: 0.13 },
  },
  "tanjiro-kamado": {
    quote: "I will not let anyone else die!",
    voice: { pitch: 1.1, rate: 1.0 },
    sting: { wave: "triangle", base: 392, motif: [0, 2, 7, 9], decay: 0.18 },
  },
  "muzan-kibutsuji": {
    quote: "I am the closest being to perfection.",
    voice: { pitch: 0.75, rate: 0.9 },
    sting: { wave: "sawtooth", base: 175, motif: [0, -3, -6, -12], decay: 0.32 },
  },
  saber: {
    quote: "I ask of you: are you my Master?",
    voice: { pitch: 1.2, rate: 1.0 },
    sting: { wave: "triangle", base: 523, motif: [0, 7, 12, 16], decay: 0.2 },
  },
  superman: {
    quote: "I'm here to fight for truth, justice and a better tomorrow.",
    voice: { pitch: 0.9, rate: 0.96 },
    sting: { wave: "sine", base: 392, motif: [0, 5, 9, 12], decay: 0.24 },
  },
  batman: {
    quote: "I am vengeance. I am the night. I am Batman.",
    voice: { pitch: 0.7, rate: 0.88 },
    sting: { wave: "sawtooth", base: 147, motif: [0, -5, -7, -12], decay: 0.34 },
  },
  "wonder-woman": {
    quote: "It's about what you believe. And I believe in love.",
    voice: { pitch: 1.05, rate: 1.0 },
    sting: { wave: "triangle", base: 440, motif: [0, 4, 7, 11], decay: 0.2 },
  },
  "the-flash": {
    quote: "Run. Run fast enough and nothing can catch you.",
    voice: { pitch: 1.15, rate: 1.2 },
    sting: { wave: "square", base: 587, motif: [0, 7, 12, 19, 24], decay: 0.09 },
  },
  "iron-man": {
    quote: "I am Iron Man.",
    voice: { pitch: 0.95, rate: 1.04 },
    sting: { wave: "square", base: 349, motif: [0, 6, 7, 6], decay: 0.15 },
  },
  thor: {
    quote: "I am Thor, son of Odin, and I will have my revenge.",
    voice: { pitch: 0.8, rate: 0.94 },
    sting: { wave: "sawtooth", base: 262, motif: [0, 7, 5, 12], decay: 0.22 },
  },
  "doctor-strange": {
    quote: "Dormammu, I've come to bargain.",
    voice: { pitch: 0.95, rate: 0.96 },
    sting: { wave: "sine", base: 330, motif: [0, 3, 6, 10], decay: 0.3 },
  },
  thanos: {
    quote: "I am inevitable.",
    voice: { pitch: 0.65, rate: 0.85 },
    sting: { wave: "sine", base: 110, motif: [0, -5, -4, -12], decay: 0.4 },
  },
  "darth-vader": {
    quote: "I find your lack of faith disturbing.",
    voice: { pitch: 0.6, rate: 0.86 },
    sting: { wave: "sawtooth", base: 131, motif: [0, -2, -5, -9], decay: 0.36 },
  },
  gandalf: {
    quote: "You shall not pass!",
    voice: { pitch: 0.85, rate: 0.92 },
    sting: { wave: "triangle", base: 294, motif: [0, 5, 7, 12], decay: 0.28 },
  },
  kratos: {
    quote: "Do not be sorry. Be better.",
    voice: { pitch: 0.72, rate: 0.9 },
    sting: { wave: "sawtooth", base: 165, motif: [0, -5, 0, -7], decay: 0.24 },
  },
  "geralt-of-rivia": {
    quote: "Evil is evil. Lesser, greater, middling, it's all the same.",
    voice: { pitch: 0.8, rate: 0.94 },
    sting: { wave: "triangle", base: 247, motif: [0, 3, 5, 7], decay: 0.22 },
  },
  "alexander-the-great": {
    quote: "There is nothing impossible to him who will try.",
    voice: { pitch: 1.0, rate: 1.0 },
    sting: { wave: "square", base: 392, motif: [0, 4, 7, 12], decay: 0.2 },
  },
  "julius-caesar": {
    quote: "Veni, vidi, vici. I came, I saw, I conquered.",
    voice: { pitch: 0.95, rate: 0.98 },
    sting: { wave: "triangle", base: 349, motif: [0, 4, 7, 5], decay: 0.22 },
  },
  "napoleon-bonaparte": {
    quote: "Impossible is a word found only in the dictionary of fools.",
    voice: { pitch: 1.05, rate: 1.06 },
    sting: { wave: "square", base: 415, motif: [0, 4, 7, 11, 12], decay: 0.16 },
  },
  "genghis-khan": {
    quote: "I am the punishment of heaven.",
    voice: { pitch: 0.7, rate: 0.9 },
    sting: { wave: "sawtooth", base: 185, motif: [0, -7, -5, -12], decay: 0.3 },
  },
  "hannibal-barca": {
    quote: "I will either find a way, or make one.",
    voice: { pitch: 0.85, rate: 0.96 },
    sting: { wave: "triangle", base: 262, motif: [0, 5, 3, 8], decay: 0.24 },
  },
  "sun-tzu": {
    quote: "All warfare is based on deception.",
    voice: { pitch: 0.9, rate: 0.9 },
    sting: { wave: "sine", base: 311, motif: [0, 2, 5, 7], decay: 0.26 },
  },
  "leonidas-i": {
    quote: "Come and take them.",
    voice: { pitch: 0.75, rate: 0.92 },
    sting: { wave: "square", base: 220, motif: [0, 0, 7, 0], decay: 0.18 },
  },
  "miyamoto-musashi": {
    quote: "There is more than one path to the top of the mountain.",
    voice: { pitch: 0.85, rate: 0.95 },
    sting: { wave: "triangle", base: 294, motif: [0, 7, 2, 0], decay: 0.2 },
  },
  "joan-of-arc": {
    quote: "I am not afraid. I was born to do this.",
    voice: { pitch: 1.2, rate: 1.0 },
    sting: { wave: "triangle", base: 440, motif: [0, 5, 9, 12], decay: 0.24 },
  },
  saladin: {
    quote: "I warn you against shedding blood and making a habit of it.",
    voice: { pitch: 0.82, rate: 0.92 },
    sting: { wave: "sine", base: 233, motif: [0, 3, 7, 10], decay: 0.28 },
  },
  "cyrus-the-great": {
    quote: "I am Cyrus, king of the world.",
    voice: { pitch: 0.85, rate: 0.95 },
    sting: { wave: "square", base: 262, motif: [0, 7, 12, 7], decay: 0.22 },
  },
  "zhuge-liang": {
    quote: "The wise win before the fight, while the ignorant fight to win.",
    voice: { pitch: 0.95, rate: 0.92 },
    sting: { wave: "sine", base: 349, motif: [0, 5, 7, 12, 7], decay: 0.24 },
  },
  "rani-lakshmibai": {
    quote: "I will not give up my Jhansi.",
    voice: { pitch: 1.18, rate: 1.04 },
    sting: { wave: "triangle", base: 466, motif: [0, 4, 7, 12, 9], decay: 0.18 },
  },
  "shivaji-bhonsale": {
    quote: "Never bow your head before injustice.",
    voice: { pitch: 0.85, rate: 1.0 },
    sting: { wave: "sawtooth", base: 247, motif: [0, 7, 5, 12], decay: 0.2 },
  },
  archimedes: {
    quote: "Give me a place to stand and I will move the earth.",
    voice: { pitch: 1.0, rate: 0.92 },
    sting: { wave: "sine", base: 523, motif: [0, 7, 12, 16, 19], decay: 0.2 },
  },
  "nikola-tesla": {
    quote: "The present is theirs. The future, for which I worked, is mine.",
    voice: { pitch: 0.9, rate: 0.9 },
    sting: { wave: "sine", base: 147, motif: [0, 12, 7, 19], decay: 0.26 },
  },
};

function hashId(id: string): number {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const SCALE = [0, 2, 3, 5, 7, 9, 10];
const WAVES: OscillatorType[] = ["triangle", "square", "sawtooth", "sine"];

/**
 * Researched profiles are not in the curated map. Give them a stable, distinct
 * sting derived from their id instead of reusing somebody else's.
 */
export function characterSoundFor(id: string | null | undefined): CharacterSound {
  if (id && CHARACTER_SOUNDS[id]) return CHARACTER_SOUNDS[id];

  const seed = hashId(id ?? "arena");
  const motif = [0, 1, 2, 3].map((step) => SCALE[(seed >> (step * 3)) % SCALE.length] + (step === 0 ? 0 : 0));

  return {
    quote: null,
    voice: { pitch: 0.85 + ((seed >> 5) % 40) / 100, rate: 0.9 + ((seed >> 9) % 20) / 100 },
    sting: {
      wave: WAVES[(seed >> 3) % WAVES.length],
      base: 180 + ((seed >> 7) % 14) * 24,
      motif,
      decay: 0.16 + ((seed >> 11) % 12) / 100,
    },
  };
}
