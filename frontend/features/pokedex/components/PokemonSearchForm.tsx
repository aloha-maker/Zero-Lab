// src/features/pokedex/components/PokemonSearchForm.tsx
"use client";

import React from "react";
import { usePokemonSearchForm } from "../hooks/usePokemonSearchForm";
import type { PokemonInfo } from "@/app/types/api";

interface SearchFormProps {
    onSearchStart: () => void;
    onSearchSuccess: (data: PokemonInfo) => void;
    onSearchError: (message: string) => void;
}

export default function PokemonSearchForm({
    onSearchStart,
    onSearchSuccess,
    onSearchError,
}: SearchFormProps) {
    // カスタムフックから必要な状態と関数を呼び出す
    const { searchQuery, setSearchQuery, loading, handleSearch } = usePokemonSearchForm({
        onSearchStart,
        onSearchSuccess,
        onSearchError,
    });

    return (
        <form onSubmit={handleSearch} className="mb-8 flex gap-2">
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ポケモン名 または 図鑑番号 (例: pikachu, 25)"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-500 placeholder-gray-500"
            />
            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
            >
                {loading ? "検索中..." : "検索"}
            </button>
        </form>
    );
}