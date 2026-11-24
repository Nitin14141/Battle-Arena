"use client";

import { useAudio } from "@/components/AudioProvider";

export function AudioToggle() {
  const { muted, toggleMuted } = useAudio();

  return (
    <button
      type="button"
      data-sound="off"
      onClick={toggleMuted}
      aria-pressed={muted}
      aria-label={muted ? "Unmute arena sound" : "Mute arena sound"}
      title={muted ? "Sound off — click to unmute" : "Sound on — click to mute"}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm transition-colors ${
        muted
          ? "border-arena-border/60 text-arena-text3 hover:border-arena-border hover:text-arena-text2"
          : "border-arena-blue/40 text-arena-blue hover:border-arena-blue"
      }`}
    >
      <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
    </button>
  );
}

export default AudioToggle;
