import { ResearchClaim, CONFIDENCE, EVIDENCE_STATUS } from "@battle-arena/shared";
import { stripInjectionPatterns } from "@battle-arena/validation";

export class WikipediaResearchAdapter {
  name = "Wikipedia Research Service";

  async fetchCharacterClaims(characterName: string): Promise<ResearchClaim[]> {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(
      characterName
    )}&format=json&origin=*`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const pages = data.query?.pages;

      if (!pages) return [];

      const pageId = Object.keys(pages)[0];
      if (pageId === "-1") return [];

      const page = pages[pageId];
      const extract = page.extract || "";

      return [
        {
          claimId: `wiki-${pageId}`,
          characterId: characterName,
          claim: stripInjectionPatterns(extract.substring(0, 300) + "..."),
          category: "overview",
          value: page.title,
          confidence: CONFIDENCE.HIGH,
          evidence: [`Wikipedia Intro Article: ${page.title}`],
          sources: [`https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`],
          status: EVIDENCE_STATUS.VERIFIED,
        },
      ];
    } catch (error) {
      console.error("Wikipedia research adapter error:", error);
      return [];
    }
  }
}
