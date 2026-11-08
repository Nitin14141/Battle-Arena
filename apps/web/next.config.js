const fs = require("fs");
const path = require("path");

/**
 * The pnpm workspace keeps one .env at the repository root. `next dev` runs in
 * apps/web, so Next would otherwise never see it. Load it here without
 * overriding anything already set in the environment.
 */
function loadRootEnv() {
  const file = path.resolve(__dirname, "../../.env");
  if (!fs.existsSync(file)) return;

  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const key = match[1];
    if (process.env[key] !== undefined) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadRootEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    qualities: [80, 100],
    deviceSizes: [640, 768, 1024, 1280, 1536, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
  },
  serverExternalPackages: ["@prisma/client"],
  logging: {
    level: process.env.LOG_LEVEL === "debug" ? "debug" : "info",
  },
};

module.exports = nextConfig;
