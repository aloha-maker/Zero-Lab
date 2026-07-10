// frontend/features/pokedex/api/getPokemonMaster.ts
import { apiClient, ApiError } from "@/lib/api-client";
import type { CandidatePokemon } from "../types";

export async function getPokemonMaster(): Promise<CandidatePokemon[]> {
    try {
        // apiClient側でプレフィックスが付与されるため "/pokemon/list" とします
        return await apiClient.get<CandidatePokemon[]>("/pokemon/list");
    } catch (err: unknown) {
        if (err instanceof ApiError) {
            // apiClient で構築済みのエラーメッセージを標準のErrorとして投げる
            throw new Error(err.message);
        } else {
            throw new Error("予期せぬエラーが発生しました");
        }
    }
}