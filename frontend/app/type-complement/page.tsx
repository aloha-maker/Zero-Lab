// frontend/app/type-complement/page.tsx
"use client";

import { useState } from "react";
import type { PokemonInfo } from "@/features/pokedex/types";
import type { ComplementaryResponse } from "@/features/type-complement/types";
import PokemonSearchForm from "@/features/pokedex/components/PokemonSearchForm";
import ComplementaryPokemonResult from "@/features/type-complement/components/ComplementaryPokemonResult";
import MatchupFilterSection from "@/features/matchup-filter/components/MatchupFilterSection";

export default function TypeComplementPage() {
    const [basePokemon, setBasePokemon] = useState<PokemonInfo | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);

    // APIから返ってきた相性補完結果を保持するステート
    const [complementResult, setComplementResult] =
        useState<ComplementaryResponse | null>(null);

    // 検索開始時にすべての状態をクリア
    const handleSearchStart = () => {
        setSearchError(null);
        setBasePokemon(null);
        setComplementResult(null);
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

                <PokemonSearchForm
                    onSearchStart={handleSearchStart}
                    onSearchSuccess={setBasePokemon}
                    onSearchError={setSearchError}
                />

                {searchError && (
                    <div className="mt-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm">
                        <p className="font-medium">{searchError}</p>
                    </div>
                )}

                {/* ①相性補完候補の取得 */}
                {basePokemon && (
                    <ComplementaryPokemonResult
                        basePokemon={basePokemon}
                        onResultFetched={setComplementResult}
                    />
                )}

                {/* ②①の候補を、苦手な相手(△×)で絞り込む */}
                {complementResult && complementResult.complements.length > 0 && (
                    <MatchupFilterSection
                        complements={complementResult.complements}
                        onFilterComplete={(result) => {
                            // 必要になったら絞り込み結果をここで受け取る
                            console.log("filtered:", result);
                        }}
                    />
                )}
            </div>
        </main>
    );
}