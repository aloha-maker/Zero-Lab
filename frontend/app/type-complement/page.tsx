// frontend/app/type-complement/page.tsx
"use client";

import { useState } from "react";
import type { PokemonInfo } from "@/features/pokedex/types";
import type { ComplementaryResponse } from "@/features/type-complement/types"; // 追加
import PokemonSearchForm from "@/features/pokedex/components/PokemonSearchForm";
import ComplementaryPokemonResult from "@/features/type-complement/components/ComplementaryPokemonResult";
// import NextStepComponent from "@/features/type-complement/components/NextStepComponent"; // 次のコンポーネント（仮）

export default function TypeComplementPage() {
    const [basePokemon, setBasePokemon] = useState<PokemonInfo | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);
    
    // 【追加】APIから返ってきた相性補完結果を保持するステート
    const [complementResult, setComplementResult] = useState<ComplementaryResponse | null>(null);

    // 検索開始時にすべての状態をクリア
    const handleSearchStart = () => {
        setSearchError(null);
        setBasePokemon(null);
        setComplementResult(null); // 結果もクリア
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

                {/* ①ここで結果取得コンポーネントを呼び出し、onResultFetchedでデータを受け取る */}
                {basePokemon && (
                    <ComplementaryPokemonResult 
                        basePokemon={basePokemon} 
                        onResultFetched={setComplementResult} 
                    />
                )}

                {/* ②受け取ったデータを、次のコンポーネントに渡す */}
                {/* 
                {complementResult && (
                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <NextStepComponent resultData={complementResult} />
                    </div>
                )} 
                */}
            </div>
        </main>
    );
}