"use client";

import { useState } from "react";
import type { PokemonInfo } from "@/features/pokedex/types";
import PokemonSearchForm from "@/features/pokedex/components/PokemonSearchForm";
import ComplementaryPokemonResult from "@/features/type-complement/components/ComplementaryPokemonResult";

export default function TypeComplementPage() {
    // フォームから受け取る主軸ポケモンの情報を保持
    const [basePokemon, setBasePokemon] = useState<PokemonInfo | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);

    // 検索開始時に古い状態をクリア
    const handleSearchStart = () => {
        setSearchError(null);
        setBasePokemon(null);
    };

    return (
        <main className="min-h-screen p-4 md:p-8 bg-slate-50">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900">相性補完ポケモン検索</h1>
                    <p className="text-slate-600 mt-2">
                        主軸ポケモンの弱点と被らない、相性の良いポケモンを提案します
                    </p>
                </header>

                {/* 既存の検索フォームを呼び出し */}
                <PokemonSearchForm 
                    onSearchStart={handleSearchStart}
                    onSearchSuccess={setBasePokemon}
                    onSearchError={setSearchError}
                />

                {/* 検索フォーム側のエラー表示 */}
                {searchError && (
                    <div className="mt-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm">
                        <p className="font-medium">{searchError}</p>
                    </div>
                )}

                {/* 検索が成功して主軸ポケモンがセットされたら、結果コンポーネントに渡して表示 */}
                {basePokemon && (
                    <ComplementaryPokemonResult basePokemon={basePokemon} />
                )}
            </div>
        </main>
    );
}