// src/features/pokedex/api/searchPokemon.ts
import { apiClient, ApiError } from "@/lib/api-client";
import type { PokemonInfo } from "../types";

export async function searchPokemon(query: string): Promise<PokemonInfo> {
    try {
        // apiClient側で API_PREFIX が付与されるため "/pokemon/..." だけでOKです
        return await apiClient.get<PokemonInfo>(`/pokemon/${query}`);
    } catch (err: unknown) {
        if (err instanceof ApiError) {
            // apiClient で構築済みのエラーメッセージを標準のErrorとして投げる
            throw new Error(err.message);
        } else {
            throw new Error("予期せぬエラーが発生しました");
        }
    }
}