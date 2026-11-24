"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  announceVictory,
  playCharacterSting,
  playClickSound,
  setAudioPreferences,
  speakCharacterQuote,
  stopSpeaking,
  unlockAudio,
} from "@/lib/audio";

interface AudioControls {
  muted: boolean;
  toggleMuted: () => void;
  playClick: () => void;
  playSting: (characterId: string | null | undefined) => void;
  speakQuote: (characterId: string | null | undefined) => void;
  announceVictory: (characterId: string | null | undefined, winnerName: string) => void;
  stopQuote: () => void;
}

const AudioCueContext = createContext<AudioControls | null>(null);
const STORAGE_KEY = "battle-arena:muted";
const VOLUME_KEY = "battle-arena:volume";

export function useAudio(): AudioControls {
  const value = useContext(AudioCueContext);
  if (value) return value;

  // Defensive fallback: a component rendered outside the provider still renders
  // and simply stays silent.
  return {
    muted: true,
    toggleMuted: () => {},
    playClick: () => {},
    playSting: () => {},
    speakQuote: () => {},
    announceVictory: () => {},
    stopQuote: () => {},
  };
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(false);
  const hydrated = useRef(false);

  // Restore the stored preference once, after hydration (localStorage is not
  // available during server rendering).
  useEffect(() => {
    let storedMuted = false;
    let storedVolume = 0.7;
    try {
      storedMuted = window.localStorage.getItem(STORAGE_KEY) === "1";
      const raw = Number(window.localStorage.getItem(VOLUME_KEY));
      if (Number.isFinite(raw) && raw > 0 && raw <= 1) storedVolume = raw;
    } catch {
      /* storage disabled — keep defaults */
    }
    setMuted(storedMuted);
    setAudioPreferences({ muted: storedMuted, volume: storedVolume });
    hydrated.current = true;
  }, []);

  useEffect(() => {
    setAudioPreferences({ muted });
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
    } catch {
      /* storage disabled — the toggle still works for this visit */
    }
  }, [muted]);

  // One capture-phase listener gives every button, link and disclosure a click
  // blip without touching each screen, and doubles as the gesture that unlocks
  // audio for autoplay-restricted browsers.
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      unlockAudio();
      const target = event.target as Element | null;
      const control = target?.closest?.(
        'button, a[href], [role="button"], summary, input[type="checkbox"], input[type="radio"]',
      );
      if (!control) return;
      if (control.closest("[data-sound='off']")) return;
      playClickSound();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((value) => {
      const next = !value;
      if (next) stopSpeaking();
      return next;
    });
  }, []);

  const value = useMemo<AudioControls>(
    () => ({
      muted,
      toggleMuted,
      playClick: playClickSound,
      playSting: playCharacterSting,
      speakQuote: speakCharacterQuote,
      announceVictory,
      stopQuote: stopSpeaking,
    }),
    [muted, toggleMuted],
  );

  return <AudioCueContext.Provider value={value}>{children}</AudioCueContext.Provider>;
}

export default AudioProvider;
