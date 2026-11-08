import { ResearchClaim, EvidenceStatus } from "@battle-arena/shared";

// Wikidata adapter result shape
export interface WikidataResult {
  id: string;
  label: string;
  aliases: string[];
  description: string;
  claims: Record<string, any>;
}

export interface ResearchAdapter {
  name: string;
  search(query: string): Promise<SearchResult[]>;
  getDetails(id: string): Promise<ResearchClaim[]>;
}

export interface SearchResult {
  id: string;
  title: string;
  source: string;
  url: string;
}
