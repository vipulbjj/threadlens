# Azure OpenAI for ThreadLens

Use your existing resource **`openclaw-openai-svc01`** (resource group `openclaw-openai-rg`) so ThreadLens bills against your Azure credits instead of xAI.

## 1. Create a new API key (recommended: separate from OpenClaw)

1. Open [Azure Portal → openclaw-openai-svc01 → Keys and Endpoint](https://portal.azure.com/#@vbajaj56gmail.onmicrosoft.com/resource/subscriptions/7e60aa11-a276-494a-a2ad-1623b28297a1/resourceGroups/openclaw-openai-rg/providers/Microsoft.CognitiveServices/accounts/openclaw-openai-svc01/cskeys).
2. Click **+ Create new key**.
3. Name it something like **`threadlens-prod`** (description optional).
4. Copy **Key 1** (or Key 2) immediately — you cannot view it again later.
5. On the same page, copy **Endpoint** — it looks like:
   `https://openclaw-openai-svc01.openai.azure.com/`
   (Some resources use `….cognitiveservices.azure.com` — either works if chat completions are enabled.)

You can keep your OpenClaw key; a dedicated ThreadLens key makes rotation and auditing easier.

## 2. Confirm a chat deployment exists

1. In the same resource, open **Model deployments** (or **Azure OpenAI Studio** → Deployments).
2. You need a deployment name ThreadLens will call — e.g. **`gpt-4o-mini`** or **`gpt-4o`**.
3. If none exists: **Deploy model** → choose **gpt-4o-mini** (cost-effective for Q&A) → set deployment name **`gpt-4o-mini`** → Create.

Note the **deployment name** exactly (not the model SKU label). ThreadLens sends that string as the model id.

## 3. Configure Vercel (Production)

In [Vercel → threadlens → Settings → Environment Variables](https://vercel.com/) for **Production**:

| Variable | Value |
|----------|--------|
| `AZURE_OPENAI_API_KEY` | Key from step 1 |
| `AZURE_OPENAI_ENDPOINT` | Endpoint from step 1 (no trailing path) |
| `AZURE_OPENAI_DEPLOYMENT` | Deployment name, e.g. `gpt-4o-mini` |
| `AZURE_OPENAI_API_VERSION` | Optional; default in code is `2024-08-01-preview` |

**Important:** Remove or delete **`XAI_API_KEY`** on Production if xAI credits are dead — otherwise it is ignored only when Azure vars are set; clearing xAI avoids confusion.

Redeploy after saving env vars.

## 4. Verify locally (optional)

Put the same values in `.env.local` (gitignored):

```bash
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://openclaw-openai-svc01.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
```

Then:

```bash
npm run verify:azure
```

## 5. Verify production (signed in)

After deploy, on https://threadlens.vercel.app (DevTools console):

```js
fetch("/api/ai-health", { credentials: "include" }).then((r) => r.json()).then(console.log);
```

Expect `{ ok: true, provider: "Azure OpenAI", model: "gpt-4o-mini", code: "ai_ok" }`.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `404` / deployment not found | `AZURE_OPENAI_DEPLOYMENT` must match the deployment **name** in Azure exactly. |
| `401` / invalid key | Regenerate key in Portal; update Vercel; redeploy. |
| `403` / quota | Check Azure subscription credits and deployment region capacity. |
| Still says xAI | Azure vars missing on Production or deploy not finished; check `/api/ai-health` `provider` field. |
