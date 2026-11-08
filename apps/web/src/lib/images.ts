export const ARENA_IMAGES = {
  hero: "/images/celestial-ring-fortress-arena.png",
  cosmic: "/images/cosmic-ui-collection.png",
  triptych: "/images/cosmic-ui-triptych.png",
  neon: "/images/neon-cyberpunk-battle-arena.png",
  neonTriptych: "/images/neon-battle-arena-triptych.png",
  sunset: "/images/sunset-battle-arena-ruins.png",
  overview: "/images/website-overview.png",
} as const;

export const ARENA_GALLERY: { src: string; title: string; tag: string }[] = [
  { src: ARENA_IMAGES.hero, title: "Celestial Ring Fortress", tag: "Primary arena" },
  { src: ARENA_IMAGES.neon, title: "Neon Cyberpunk Arena", tag: "Night circuit" },
  { src: ARENA_IMAGES.sunset, title: "Sunset Ruins", tag: "Historic ground" },
  { src: ARENA_IMAGES.triptych, title: "Cosmic Triptych", tag: "Multiverse" },
  { src: ARENA_IMAGES.neonTriptych, title: "Neon Triptych", tag: "Energy field" },
  { src: ARENA_IMAGES.cosmic, title: "Cosmic UI Collection", tag: "Command deck" },
];

function hash(value: string): number {
  let result = 0;
  for (let i = 0; i < value.length; i += 1) {
    result = (result * 31 + value.charCodeAt(i)) >>> 0;
  }
  return result;
}

/** Stable arena backdrop for a character or matchup. */
export function arenaImageFor(seed: string): string {
  const index = hash(seed) % ARENA_GALLERY.length;
  return ARENA_GALLERY[index].src;
}
