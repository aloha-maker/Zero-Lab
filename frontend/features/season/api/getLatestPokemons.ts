// frontend/features/season/api/getLatestPokemons.ts
import { apiClient, ApiError } from "@/lib/api-client";
import type { SeasonPokemonResponse } from "../types";

export async function getLatestPokemons(): Promise<SeasonPokemonResponse> {
    try {
        // apiClient側でプレフィックスが自動付与されるため "/seasons/latest_pokemons" とします
        return await apiClient.get<SeasonPokemonResponse>("/seasons/latest_pokemons");
    } catch (err: unknown) {
        if (err instanceof ApiError) {
            // apiClient で構築済みのエラーメッセージを標準のErrorとして投げる
            throw new Error(err.message);
        } else {
            throw new Error("予期せぬエラーが発生しました");
        }
    }
}