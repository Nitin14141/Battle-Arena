import { ResearchClaim, CONFIDENCE, EVIDENCE_STATUS } from "@battle-arena/shared";
import { stripInjectionPatterns } from "@battle-arena/validation";

export class WikidataResearchAdapter {
  name = "Wikidata Research Service";

  async fetchCharacterClaims(characterName: string): Promise<ResearchClaim[]> {
    const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
      characterName
    )}&language=en&format=json&origin=*`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!data.search || data.search.length === 0) {
        return [];
      }

      const entity = data.search[0];
      const entityId = entity.id;
      const description = entity.description || "No description available.";

      return [
        {
          claimId: `${entityId}-bio`,
          characterId: entityId,
          claim: stripInjectionPatterns(description),
          category: "biography",
          value: entity.label,
          confidence: CONFIDENCE.HIGH,
          evidence: [`Wikidata Entity Record: ${entityId}`],
          sources: [entity.concepturi || `https://www.wikidata.org/wiki/${entityId}`],
          status: EVIDENCE_STATUS.VERIFIED,
        },
      ];
    } catch (error) {
      console.error("Wikidata research adapter error:", error);
      return [];
    }
  }
}
