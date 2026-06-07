import Anthropic from "@anthropic-ai/sdk";

interface LLMMessage {
  system: string;
  user: string;
}

type LLMProvider = "ollama" | "anthropic";

function getProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER?.toLowerCase();
  if (provider === "anthropic") return "anthropic";
  return "ollama";
}

async function callOllama({ system, user }: LLMMessage): Promise<string> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_MODEL ?? "llama3.2";

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Ollama request failed (${response.status}): ${body}. Is Ollama running? Try: ollama serve`,
    );
  }

  const data = (await response.json()) as {
    message?: { content?: string };
  };

  const content = data.message?.content?.trim();
  if (!content) {
    throw new Error("Ollama returned an empty response");
  }

  return content;
}

async function callAnthropic({ system, user }: LLMMessage): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your_key_here") {
    throw new Error(
      "ANTHROPIC_API_KEY is not configured. Set it in .env.local for anthropic provider.",
    );
  }

  const model =
    process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";
  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model,
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: user }],
  });

  const block = message.content[0];
  if (block.type !== "text") {
    throw new Error("Anthropic returned a non-text response");
  }

  return block.text.trim();
}

export async function callLLM(messages: LLMMessage): Promise<string> {
  const provider = getProvider();

  if (provider === "anthropic") {
    return callAnthropic(messages);
  }

  return callOllama(messages);
}

export function getActiveProviderLabel(): string {
  return getProvider() === "anthropic" ? "Claude" : "Ollama (local)";
}
