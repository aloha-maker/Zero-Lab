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