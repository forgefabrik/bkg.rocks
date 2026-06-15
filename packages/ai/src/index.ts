export type AiProvider = "openai" | "anthropic" | "local";

export interface AiRequest {
  provider: AiProvider;
  prompt: string;
}

export interface AiResponse {
  provider: AiProvider;
  content: string;
}

export async function generateAiResponse(request: AiRequest): Promise<AiResponse> {
  return {
    provider: request.provider,
    content: request.prompt,
  };
}
