import { LlmProvider, LlmRequest } from "./dtos.js";
const OLLAMA_MODEL = "qwen2.5:7b-instruct-q4_K_M";
const OLLAMA_URL = "http://localhost:11434/api/chat";

/**
 * undici reports an unreachable host as a bare "fetch failed", and a timeout as
 * "The operation was aborted". Neither says which service, so the message
 * surfaces in the document grid as if the parser had broken. Name the actual
 * failure instead — this is the most common way extraction stops working.
 */
function describeNetworkError(error: unknown): string {
  const name = (error as { name?: string })?.name;
  if (name === "TimeoutError" || name === "AbortError") {
    return `Ollama did not respond within 120s. The model may still be loading — check \`ollama ps\`.`;
  }
  return (
    `Cannot reach Ollama at ${OLLAMA_URL}. Is it running? Start it with \`ollama serve\`. ` +
    `(${error instanceof Error ? error.message : String(error)})`
  );
}

export const OllamaProvider: LlmProvider = {
  name: "ollama",
  async complete(request: LlmRequest): Promise<unknown> {
    let response: Response;
    try {
      response = await fetch(OLLAMA_URL, {
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
            num_predict: 2048,
          },
        }),
        signal: AbortSignal.timeout(120_000),
      });
    } catch (error) {
      // Retryable on purpose: Ollama being down is a transient condition, not a
      // bad document.
      throw new Error(describeNetworkError(error));
    }

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
