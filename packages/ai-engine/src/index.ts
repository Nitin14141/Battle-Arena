import { AIRequest, AIResponse, getEnv } from "@battle-arena/shared";
import { sanitizeForAI } from "@battle-arena/validation";
import { AIProvider, MockAIProvider } from "./providers/mock";
import { OllamaAIProvider } from "./providers/ollama";
import { OpenRouterAIProvider } from "./providers/openrouter";

export class AIService {
  private provider: AIProvider;

  constructor() {
    try {
      const env = getEnv();
      if (env.AI_PROVIDER === "openrouter" && process.env.OPENROUTER_API_KEY) {
        this.provider = new OpenRouterAIProvider(
          process.env.OPENROUTER_API_KEY,
          process.env.OPENROUTER_BASE_URL,
          process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat:free",
          env.AI_TIMEOUT
        );
      } else if (env.AI_PROVIDER === "ollama") {
        this.provider = new OllamaAIProvider(env.AI_BASE_URL, env.AI_MODEL, env.AI_TIMEOUT);
      } else {
        this.provider = new MockAIProvider();
      }
    } catch {
      this.provider = new MockAIProvider();
    }
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const sanitizedRequest: AIRequest = {
      ...request,
      prompt: sanitizeForAI(request.prompt),
      systemPrompt: request.systemPrompt ? sanitizeForAI(request.systemPrompt) : undefined,
    };

    return this.provider.generate(sanitizedRequest);
  }
}

export const aiService = new AIService();

export * from "./free-model";
