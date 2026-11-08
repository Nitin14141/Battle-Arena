import { AIRequest, AIResponse, PROMPT_VERSION } from "@battle-arena/shared";
import { AIProvider } from "./mock";

export class OllamaAIProvider implements AIProvider {
  name = "ollama";
  private baseUrl: string;
  private model: string;
  private timeout: number;

  constructor(baseUrl = "http://localhost:11434", model = "qwen3:4b", timeout = 120000) {
    this.baseUrl = baseUrl;
    this.model = model;
    this.timeout = timeout;
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();
    const url = `${this.baseUrl}/api/generate`;

    const prompt = `${request.systemPrompt || ""}\n\nTask: ${request.task}\nPrompt: ${request.prompt}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: request.model || this.model,
          prompt,
          stream: false,
          format: request.schema ? "json" : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama request failed with status ${response.status}`);
      }

      const data = await response.json();
      const raw = data.response || "";

      let parsedData = null;
      try {
        parsedData = JSON.parse(raw);
      } catch {
        parsedData = { text: raw };
      }

      return {
        success: true,
        data: parsedData,
        raw,
        model: request.model || this.model,
        promptVersion: PROMPT_VERSION,
        durationMs: Date.now() - start,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        raw: null,
        model: request.model || this.model,
        promptVersion: PROMPT_VERSION,
        durationMs: Date.now() - start,
        error: error.message || "Unknown AI error",
      };
    }
  }
}
