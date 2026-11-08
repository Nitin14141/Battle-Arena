import { AIRequest, AIResponse, PROMPT_VERSION } from "@battle-arena/shared";

export interface AIProvider {
  name: string;
  generate(request: AIRequest): Promise<AIResponse>;
}

export class MockAIProvider implements AIProvider {
  name = "mock";

  async generate(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();

    // Simulate realistic inference delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let mockData: Record<string, unknown> = {
      result: "Mock AI analysis completed successfully.",
      winner: "Character A",
      confidence: "high",
    };

    if (request.task === "intelligence_analysis") {
      mockData = {
        tacticalAdvantage: "Character A demonstrates superior strategic planning and adaptability.",
        scoreA: 85,
        scoreB: 70,
      };
    } else if (request.task === "strength_analysis") {
      mockData = {
        combatAdvantage: "Character B holds higher raw durability and attack power.",
        scoreA: 65,
        scoreB: 90,
      };
    }

    return {
      success: true,
      data: mockData,
      raw: JSON.stringify(mockData),
      model: "mock-qwen3-4b",
      promptVersion: PROMPT_VERSION,
      durationMs: Date.now() - start,
    };
  }
}
