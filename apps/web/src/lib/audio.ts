"use client";

import { characterSoundFor } from "@/data/character-sounds";

/**
 * All arena sound is generated in the browser with Web Audio and the speech
 * synthesiser: no audio files, no downloads, no licensing or CORS problems, and
 * nothing that can 404 later. The simulation engine never imports this module.
 */

let context: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let volume = 0.7;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function setAudioPreferences(next: { muted?: boolean; volume?: number }) {
  if (typeof next.muted === "boolean") muted = next.muted;
  if (typeof next.volume === "number") volume = clamp(next.volume, 0, 1);
  if (master && context) {
    master.gain.setTargetAtTime(muted ? 0 : volume, context.currentTime, 0.01);
  }
}

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!context) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      context = new Ctor();
    } catch {
      return null;
    }
    master = context.createGain();
    master.gain.value = muted ? 0 : volume;
    master.connect(context.destination);
  }

  if (context.state === "suspended") void context.resume();
  return context;
}

/** Called from the first real user gesture so later playback is allowed. */
export function unlockAudio() {
  const audio = audioContext();
  if (audio && audio.state === "suspended") void audio.resume();
}

/** Short UI blip for button and link presses. */
export function playClickSound() {
  const audio = audioContext();
  if (!audio || !master || muted) return;

  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(1040, now);
  osc.frequency.exponentialRampToValueAtTime(520, now + 0.05);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.16, now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

  osc.connect(gain).connect(master);
  osc.start(now);
  osc.stop(now + 0.09);
}

/** A fighter's signature sting, synthesised from their sound configuration. */
export function playCharacterSting(characterId: string | null | undefined) {
  const audio = audioContext();
  if (!audio || !master || muted) return;

  const { sting } = characterSoundFor(characterId);
  const output = master;
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = clamp(sting.base * 10, 900, 14000);
  filter.Q.value = 0.9;
  filter.connect(output);

  const start = audio.currentTime + 0.02;

  sting.motif.forEach((semitone, index) => {
    const at = start + index * sting.decay * 0.72;
    const frequency = sting.base * Math.pow(2, semitone / 12);

    const noteGain = audio.createGain();
    noteGain.gain.setValueAtTime(0.0001, at);
    noteGain.gain.exponentialRampToValueAtTime(0.26, at + 0.012);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, at + sting.decay);
    noteGain.connect(filter);

    const osc = audio.createOscillator();
    osc.type = sting.wave;
    osc.frequency.setValueAtTime(frequency, at);
    osc.detune.value = index % 2 === 0 ? -6 : 6;
    osc.connect(noteGain);
    osc.start(at);
    osc.stop(at + sting.decay + 0.05);

    if (index === 0) {
      const sub = audio.createOscillator();
      const subGain = audio.createGain();
      sub.type = "sine";
      sub.frequency.setValueAtTime(frequency / 2, at);
      sub.frequency.exponentialRampToValueAtTime(Math.max(38, frequency / 4), at + sting.decay);
      subGain.gain.setValueAtTime(0.0001, at);
      subGain.gain.exponentialRampToValueAtTime(0.3, at + 0.01);
      subGain.gain.exponentialRampToValueAtTime(0.0001, at + sting.decay * 0.9);
      sub.connect(subGain).connect(output);
      sub.start(at);
      sub.stop(at + sting.decay + 0.05);
    }
  });
}

let cachedVoice: SpeechSynthesisVoice | null = null;

function preferredVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  if (cachedVoice && voices.includes(cachedVoice)) return cachedVoice;

  const english = voices.filter((voice) => voice.lang?.toLowerCase().startsWith("en"));
  const pool = english.length > 0 ? english : voices;
  cachedVoice =
    pool.find((voice) => /google uk english male|daniel|alex|fred/i.test(voice.name)) ??
    pool.find((voice) => /google/i.test(voice.name)) ??
    pool[0] ??
    null;
  return cachedVoice;
}

/** Queues one spoken line, optionally continuing when the voice finishes. */
function speakLine(
  text: string,
  voice: { pitch: number; rate: number },
  onEnd?: () => void,
): boolean {
  if (typeof window === "undefined") return false;
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") return false;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = clamp(voice.pitch, 0, 2);
  utterance.rate = clamp(voice.rate, 0.1, 10);
  utterance.volume = clamp(volume, 0, 1);

  const voiceName = preferredVoice();
  if (voiceName) utterance.voice = voiceName;
  if (onEnd) utterance.onend = onEnd;

  window.speechSynthesis.speak(utterance);
  return true;
}

/** Speaks a fighter's victory line with the browser's own voice. */
export function speakCharacterQuote(characterId: string | null | undefined) {
  if (typeof window === "undefined" || muted) return;

  const sound = characterSoundFor(characterId);
  if (!sound.quote) return;

  stopSpeaking();
  speakLine(sound.quote, sound.voice);
}

/**
 * The post-fight announcement, in the order a fight is called: the words come
 * first — "<Fighter> wins." — then the winner's signature sting, then their
 * victory line. Browsers without speech synthesis still get the sting.
 */
export function announceVictory(characterId: string | null | undefined, winnerName: string) {
  if (typeof window === "undefined" || muted) return;

  const name = (winnerName ?? "").trim();
  const sound = characterSoundFor(characterId);
  stopSpeaking();

  if (!name) {
    playCharacterSting(characterId);
    return;
  }

  const quote = sound.quote;
  const started = speakLine(`${name} wins.`, sound.voice, () => {
    playCharacterSting(characterId);
    if (!quote) return;
    window.setTimeout(() => {
      if (muted) return;
      speakLine(quote, sound.voice);
    }, 800);
  });

  if (!started) playCharacterSting(characterId);
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}
