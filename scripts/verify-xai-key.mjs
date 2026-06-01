#!/usr/bin/env node
/**
 * Verify XAI_API_KEY against api.x.ai (loads .env, .env.local, .env.production.local).
 * Usage: node scripts/verify-xai-key.mjs
 * Does not print the API key.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(filename) {
  const path = resolve(root, filename);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "").trim();
    }
  }
}

for (const f of [".env", ".env.local", ".env.production.local"]) loadEnv(f);

const key = process.env.XAI_API_KEY?.trim();
const model = process.env.XAI_MODEL?.trim() || "grok-4.20-0309-non-reasoning";

if (!key) {
  console.error("No XAI_API_KEY in .env / .env.local / .env.production.local");
  console.error(
    "Note: `vercel env pull` leaves secrets empty (XAI_API_KEY=\"\"). Paste a real key locally or update Vercel."
  );
  process.exit(1);
}

console.log(`Probing xAI model=${model} …`);

const client = new OpenAI({ apiKey: key, baseURL: "https://api.x.ai/v1" });

try {
  const res = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: "Reply with exactly: ok" }],
    max_tokens: 5,
    temperature: 0,
  });
  const text = res.choices[0]?.message?.content?.trim() || "(empty)";
  console.log("OK — xAI accepted the key.");
  console.log("Sample reply:", text.slice(0, 80));
  process.exit(0);
} catch (err) {
  const status = err?.status ?? "unknown";
  const msg = (err?.message || String(err)).slice(0, 300);
  console.error(`FAIL — HTTP ${status}`);
  console.error(msg);
  if (status === 401 || /bad credentials/i.test(msg)) {
    console.error("\nFix: create a new key at https://console.x.ai/ → API keys, then:");
    console.error("  vercel env rm XAI_API_KEY production -y");
    console.error("  vercel env add XAI_API_KEY production   # paste new key");
    console.error("  vercel --prod   # redeploy");
  }
  process.exit(1);
}
