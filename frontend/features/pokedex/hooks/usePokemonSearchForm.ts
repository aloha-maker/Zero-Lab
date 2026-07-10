// src/features/pokedex/hooks/usePokemonSearchForm.ts
import { useState } from "react";
import type { PokemonInfo } from "../types";
import { searchPokemon } from "../api/searchPokemon";

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
            // API層で成形されたメッセージをそのまま利用する
            if (err instanceof Error) {
                onSearchError(err.message);
            } else {
                onSearchError("不明なエラーが発生しました");
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