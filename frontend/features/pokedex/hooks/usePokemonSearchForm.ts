// src/features/pokedex/hooks/usePokemonSearchForm.ts
import { useState } from "react";
import type { PokemonInfo } from "../types";
import { apiClient, ApiError } from "@/lib/api-client";

interface UsePokemonSearchFormProps {
    onSearchStart: () => void;
    onSearchSuccess: (data: PokemonInfo) => void;
    onSearchError: (message: string) => void;
}

export const usePokemonSearchForm = ({
    onSearchStart,
    onSearchSuccess,
    onSearchError,
}: UsePokemonSearchFormProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        onSearchStart();
        setLoading(true);

        try {
            // エラーパースやURLの結合は apiClient が全てやってくれるため、これだけで済みます
            const data = await apiClient.get<PokemonInfo>(`/api/v1/pokemon/${searchQuery.toLowerCase()}`);
            onSearchSuccess(data);

        } catch (err: unknown) {
            console.error("Error:", err);
            if (err instanceof ApiError) {
                // apiClient で構築済みのエラーメッセージをそのまま渡す
                onSearchError(err.message);
            } else {
                onSearchError("予期せぬエラーが発生しました");
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        searchQuery,
        setSearchQuery,
        loading,
        handleSearch,
    };
};