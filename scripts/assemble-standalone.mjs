// Assembles a self-contained Next.js deploy artifact.
// `next build` (output: "standalone") emits .next/standalone with server.js,
// but static assets and public/ must be copied in alongside it.
import { cpSync, existsSync } from "node:fs";

cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });

if (existsSync("public")) {
  cpSync("public", ".next/standalone/public", { recursive: true });
}

console.log("Assembled .next/standalone deploy artifact.");
