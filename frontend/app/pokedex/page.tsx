// src/app/pokedex/page.tsx
"use client";

import { useState } from "react";
import type { PokemonInfo } from "@/features/pokedex/types";
import PokemonSearchForm from "@/features/pokedex/components/PokemonSearchForm";
import PokemonDetailCard from "@/features/pokedex/components/PokemonDetailCard";

export default function PokedexPage() {
    const [pokemon, setPokemon] = useState<PokemonInfo | null>(null);
    const [error, setError] = useState<string | null>(null);

    // 検索開始時に古い状態をクリア
    const handleSearchStart = () => {
        setError(null);
        setPokemon(null);
    };

    return (
        <main className="min-h-screen p-4 md:p-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">ポケモン図鑑</h1>
                    <p className="text-gray-600 mt-2">PokeAPIから取得した詳細情報を表示します</p>
                </header>

                {/* 検索フォームコンポーネント */}
                <PokemonSearchForm 
                    onSearchStart={handleSearchStart}
                    onSearchSuccess={setPokemon}
                    onSearchError={setError}
                />

                {/* エラー表示 */}
                {error && (
                    <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-sm">
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {/* 検索結果表示（コンポーネント化） */}
                {pokemon && <PokemonDetailCard pokemon={pokemon} />}
            </div>
        </main>
    );
}