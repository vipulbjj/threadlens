import OpenAI, { AzureOpenAI } from "openai";

export type AiProviderId = "azure" | "groq" | "xai" | "none";

export interface ResolvedAiProvider {
  id: AiProviderId;
  client: OpenAI;
  /** Model id for xAI/Groq; Azure deployment name when id is azure. */
  model: string;
  label: string;
}

const DEFAULT_AZURE_API_VERSION = "2024-08-01-preview";
const DEFAULT_AZURE_DEPLOYMENT = "gpt-4o-mini";

function trimEnv(name: string): string | undefined {
  const v = process.env[name]?.trim();
  return v || undefined;
}

/** Strip trailing slash; Azure SDK expects host only, e.g. https://….openai.azure.com */
export function normalizeAzureEndpoint(endpoint: string): string {
  return endpoint.replace(/\/+$/, "");
}

function resolveAzureOpenAI(): ResolvedAiProvider | null {
  const apiKey = trimEnv("AZURE_OPENAI_API_KEY");
  const endpoint = trimEnv("AZURE_OPENAI_ENDPOINT");
  if (!apiKey || !endpoint) return null;

  const deployment =
    trimEnv("AZURE_OPENAI_DEPLOYMENT") ?? trimEnv("AZURE_OPENAI_MODEL") ?? DEFAULT_AZURE_DEPLOYMENT;
  const apiVersion = trimEnv("AZURE_OPENAI_API_VERSION") ?? DEFAULT_AZURE_API_VERSION;

  const client = new AzureOpenAI({
    apiKey,
    endpoint: normalizeAzureEndpoint(endpoint),
    deployment,
    apiVersion,
  });

  return {
    id: "azure",
    client,
    model: deployment,
    label: "Azure OpenAI",
  };
}

/**
 * Provider order: Azure (your credits) → xAI → Groq.
 * Set env in Vercel; remove XAI_API_KEY if xAI credits are exhausted.
 */
export function resolveAiProvider(): ResolvedAiProvider | null {
  const azure = resolveAzureOpenAI();
  if (azure) return azure;

  const xaiKey = trimEnv("XAI_API_KEY");
  if (xaiKey) {
    return {
      id: "xai",
      client: new OpenAI({ apiKey: xaiKey, baseURL: "https://api.x.ai/v1" }),
      model: trimEnv("XAI_MODEL") || "grok-4.20-0309-non-reasoning",
      label: "xAI",
    };
  }

  const groqKey = trimEnv("GROQ_API_KEY");
  if (groqKey) {
    return {
      id: "groq",
      client: new OpenAI({ apiKey: groqKey, baseURL: "https://api.groq.com/openai/v1" }),
      model: trimEnv("GROQ_MODEL") || "llama-3.3-70b-versatile",
      label: "Groq",
    };
  }

  return null;
}

export function systemPromptForUseCase(useCase?: string) {
  const base =
    "You help people understand chat exports: communication patterns, emotional tone, repair attempts, and practical next steps. Be direct, kind, and neutral — never take sides in relationship conflicts. Never claim to be a therapist, lawyer, or crisis counselor. If someone may be unsafe, suggest professional or crisis resources. Use evidence from the transcript; cite who said what when helpful. Keep answers under 400 words unless asked for more.";

  if (useCase === "couples") {
    return (
      base +
      " Focus on de-escalation, mutual understanding, and fair communication — not blame. Suggest constructive next messages when asked."
    );
  }
  if (useCase === "work") {
    return base + " Focus on boundaries and professional tone; do not advise violating workplace policies.";
  }
  return base;
}
