import { ResearchClaim } from "@battle-arena/shared";
import { WikidataResearchAdapter } from "./adapters/wikidata";
import { WikipediaResearchAdapter } from "./adapters/wikipedia";

export class ResearchCoordinator {
  private adapters = [
    new WikidataResearchAdapter(),
    new WikipediaResearchAdapter()
  ];

  async performAutomaticResearch(characterName: string): Promise<ResearchClaim[]> {
    const allClaims: ResearchClaim[] = [];

    // Run adapters in parallel
    const results = await Promise.allSettled(
      this.adapters.map(adapter => adapter.fetchCharacterClaims(characterName))
    );

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allClaims.push(...result.value);
      }
    });

    // Simple deduplication by claimId
    const uniqueClaims = Array.from(new Map(allClaims.map(c => [c.claimId, c])).values());

    return uniqueClaims;
  }
}

export const researchService = new ResearchCoordinator();
