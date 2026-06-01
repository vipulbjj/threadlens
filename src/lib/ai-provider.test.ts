import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { normalizeAzureEndpoint, resolveAiProvider } from "./ai-provider";

describe("normalizeAzureEndpoint", () => {
  it("strips trailing slashes", () => {
    expect(normalizeAzureEndpoint("https://foo.openai.azure.com/")).toBe(
      "https://foo.openai.azure.com"
    );
  });
});

describe("resolveAiProvider", () => {
  const env = process.env;

  beforeEach(() => {
    vi.stubEnv("AZURE_OPENAI_API_KEY", "");
    vi.stubEnv("AZURE_OPENAI_ENDPOINT", "");
    vi.stubEnv("AZURE_OPENAI_DEPLOYMENT", "");
    vi.stubEnv("GROQ_API_KEY", "");
    vi.stubEnv("XAI_API_KEY", "");
    vi.stubEnv("XAI_MODEL", "");
  });

  afterEach(() => {
    process.env = env;
    vi.unstubAllEnvs();
  });

  it("prefers Azure when endpoint and key are set", () => {
    vi.stubEnv("AZURE_OPENAI_API_KEY", "azure-key");
    vi.stubEnv("AZURE_OPENAI_ENDPOINT", "https://openclaw-openai-svc01.openai.azure.com/");
    vi.stubEnv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o-mini");
    vi.stubEnv("XAI_API_KEY", "xai-key");
    const provider = resolveAiProvider();
    expect(provider?.id).toBe("azure");
    expect(provider?.model).toBe("gpt-4o-mini");
    expect(provider?.label).toBe("Azure OpenAI");
  });

  it("defaults xAI to grok-4.20 slug when Azure unset", () => {
    vi.stubEnv("XAI_API_KEY", "test-key");
    const provider = resolveAiProvider();
    expect(provider?.id).toBe("xai");
    expect(provider?.model).toBe("grok-4.20-0309-non-reasoning");
  });
});
