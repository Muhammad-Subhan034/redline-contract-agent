const HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions";
const DEFAULT_MODEL = process.env.HF_CHAT_MODEL || "meta-llama/Llama-3.1-8B-Instruct:novita";

export async function hfChat(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  opts: { maxTokens?: number; temperature?: number; model?: string } = {}
): Promise<string | null> {
  const token = process.env.HUGGINGFACE_API_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(HF_ROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: opts.model || DEFAULT_MODEL,
        messages,
        max_tokens: opts.maxTokens ?? 220,
        temperature: opts.temperature ?? 0.4,
      }),
      signal: AbortSignal.timeout(25_000),
    });

    if (!res.ok) {
      console.error("HF router error", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() ?? null;
  } catch (err) {
    console.error("HF router call failed", err);
    return null;
  }
}
