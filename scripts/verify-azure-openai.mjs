#!/usr/bin/env node
/**
 * Verify Azure OpenAI credentials (loads .env, .env.local, .env.production.local).
 * Usage: npm run verify:azure
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { AzureOpenAI } from "openai";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(filename) {
  const path = resolve(root, filename);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^(?:export\s+)?([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) {
      const val = m[2].replace(/^['"]|['"]$/g, "").trim();
      if (val) process.env[m[1]] = val;
    }
  }
}

for (const f of [".env", ".env.local", ".env.production.local"]) loadEnv(f);

const apiKey = process.env.AZURE_OPENAI_API_KEY?.trim();
const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim()?.replace(/\/+$/, "");
const deployment =
  process.env.AZURE_OPENAI_DEPLOYMENT?.trim() ||
  process.env.AZURE_OPENAI_MODEL?.trim() ||
  "gpt-4o-mini";
const apiVersion = process.env.AZURE_OPENAI_API_VERSION?.trim() || "2024-08-01-preview";

if (!apiKey || !endpoint) {
  console.error("Missing AZURE_OPENAI_API_KEY and/or AZURE_OPENAI_ENDPOINT.");
  console.error("See docs/AZURE_OPENAI_SETUP.md");
  process.exit(1);
}

console.log(`Probing Azure deployment=${deployment} endpoint=${endpoint} …`);

const client = new AzureOpenAI({ apiKey, endpoint, deployment, apiVersion });

try {
  const res = await client.chat.completions.create({
    model: deployment,
    messages: [{ role: "user", content: "Reply with exactly: ok" }],
    max_tokens: 5,
    temperature: 0,
  });
  const text = res.choices[0]?.message?.content?.trim() || "(empty)";
  console.log("OK — Azure accepted the key and deployment.");
  console.log("Sample reply:", text.slice(0, 80));
  process.exit(0);
} catch (err) {
  const status = err?.status ?? "unknown";
  const msg = (err?.message || String(err)).slice(0, 400);
  console.error(`FAIL — HTTP ${status}`);
  console.error(msg);
  if (status === 404 || /deployment/i.test(msg)) {
    console.error("\nFix: set AZURE_OPENAI_DEPLOYMENT to an existing deployment name in Azure Portal.");
  }
  process.exit(1);
}
