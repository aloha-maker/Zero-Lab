// src/features/pokedex/hooks/usePokemonSearchForm.ts
import { useState } from "react";
import type { PokemonInfo } from "../types";
import { ApiError } from "@/lib/api-client";
import { searchPokemon } from "../api/searchPokemon"; // 作成したAPI関数をインポート

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
            // API通信を別ファイルに切り出した関数で実行
            const data = await searchPokemon(searchQuery);
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