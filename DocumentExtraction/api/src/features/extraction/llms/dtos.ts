export interface LlmRequest {
  system: string;
  prompt: string;
  schema: Record<string, unknown>;
}

export interface LlmProvider {
  name: string;
  complete(request: LlmRequest): Promise<unknown>; //parsed Json JSON.parse(result.message.content)
}
