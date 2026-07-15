// frontend/features/settings/types/index.ts
export interface SyncSummary {
    species_count: number;
    pokemon_count: number;
    types_count: number;
    abilities_count: number;
    moves_relations_count: number;
}

export interface SyncResult {
    message: string;
    summary: SyncSummary;
}

export interface ScrapeSummary {
    pokemon_id: number;
    scraped_count: number;
    upserted_count: number;
    unmatched_names: string[];
}
    
export interface ScrapeResult {
    status: string;
    message: string;
    summary: ScrapeSummary;
}