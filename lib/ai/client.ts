import { AIProvider } from "@prisma/client";

function extractLikelyJson(text: string) {
  const cleaned = text.replace(/```json/g, "```").replace(/```/g, "").trim();
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first >= 0 && last > first) return cleaned.slice(first, last + 1);
  return cleaned;
}

function extractOpenAIText(resp: any): string {
  if (typeof resp?.output_text === "string" && resp.output_text.trim()) return resp.output_text;

  const outputs = resp?.output;
  if (Array.isArray(outputs)) {
    const chunks: string[] = [];
    for (const item of outputs) {
      const content = item?.content;
      if (Array.isArray(content)) {
        for (const c of content) {
          const t = c?.text ?? c?.output_text;
          if (typeof t === "string") chunks.push(t);
        }
      }
    }
    if (chunks.length) return chunks.join("\n");
  }
  return JSON.stringify(resp);
}

function extractAnthropicText(resp: any): string {
  const content = resp?.content;
  if (Array.isArray(content)) {
    return content
      .map((c: any) => (c?.type === "text" ? c.text : ""))
      .filter(Boolean)
      .join("\n");
  }
  return JSON.stringify(resp);
}

export async function generateTextWithProvider(opts: {
  provider: AIProvider;
  apiKey: string;
  model: string;
  prompt: string;
}): Promise<string> {
  const { provider, apiKey, model, prompt } = opts;

  if (provider === "OPENAI") {
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        input: prompt,
        temperature: 0.2
      })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error?.message || "OpenAI request failed");
    return extractOpenAIText(data);
  }

  if (provider === "ANTHROPIC") {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model,
        max_tokens: 1800,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error?.message || "Anthropic request failed");
    return extractAnthropicText(data);
  }

  throw new Error("Provider is MOCK (no remote call).");
}

export function parseJsonFromModelText(text: string) {
  const maybe = extractLikelyJson(text);
  return JSON.parse(maybe);
}
