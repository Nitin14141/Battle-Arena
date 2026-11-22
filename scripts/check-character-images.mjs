/**
 * Verifies that every portrait URL in the curated map is reachable and large
 * enough to render sharply in a tile. Run after regenerating the map:
 *
 *   node scripts/check-character-images.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "apps/web/src/data/character-images.ts"), "utf8");
const MIN_WIDTH = 180;

function dimensions(buffer) {
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let i = 2;
    while (i < buffer.length - 9) {
      if (buffer[i] !== 0xff) { i += 1; continue; }
      const marker = buffer[i + 1];
      const length = buffer.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return [buffer.readUInt16BE(i + 7), buffer.readUInt16BE(i + 5)];
      }
      i += 2 + length;
    }
  }
  if (buffer.slice(0, 4).toString() === "RIFF") {
    const format = buffer.slice(12, 16).toString();
    if (format === "VP8X") return [1 + buffer.readUIntLE(24, 3), 1 + buffer.readUIntLE(27, 3)];
    if (format === "VP8 ") return [buffer.readUInt16LE(26) & 0x3fff, buffer.readUInt16LE(28) & 0x3fff];
  }
  return [0, 0];
}

let failures = 0;
const entries = [...source.matchAll(/"([a-z0-9-]+)": \{ url: "([^"]+)"/g)];
for (const [, id, url] of entries) {
  try {
    const response = await fetch(url, { headers: { "user-agent": "BattleArena/0.2 (portrait check)" } });
    if (!response.ok) {
      console.log(`FAIL ${id} HTTP ${response.status}`);
      failures += 1;
      continue;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const [width, height] = dimensions(buffer);
    if (width < MIN_WIDTH) {
      console.log(`SMALL ${id} ${width}x${height}`);
      failures += 1;
    }
  } catch (error) {
    console.log(`FAIL ${id} ${error.message}`);
    failures += 1;
  }
}

console.log(`\n${entries.length - failures}/${entries.length} portraits OK`);
process.exit(failures === 0 ? 0 : 1);
