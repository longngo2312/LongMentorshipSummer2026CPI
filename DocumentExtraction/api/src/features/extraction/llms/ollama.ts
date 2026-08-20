import { LlmProvider, LlmRequest } from "./dtos.js";
const OLLAMA_MODEL = "qwen2.5:7b-instruct-q4_K_M";

export const OllamaProvider: LlmProvider = {
  name: "ollama",
  async complete(request: LlmRequest): Promise<unknown> {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: "system", content: request.system },
          { role: "user", content: request.prompt },
        ],
        format: request.schema,
        stream: false,
        keep_alive: "30m",
        options: {
          temperature: 0,
          num_ctx: 8192,
          num_predict: 1024,
        },
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!response.ok) {
      const msg = await response.text();
      const permanent = response.status === 404;
      const err = new Error(`Ollama ${response.status}: ${msg}`);
      (err as any).permanent = permanent;
      throw err;
    }

    const result = await response.json();
    return JSON.parse(result.message.content);
  },
};
