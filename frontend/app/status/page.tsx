// frontend/app/status/page.tsx
"use client";

import { useState, useCallback } from "react";
import StatForm from "@/features/stat-calculator/components/StatForm";
import PokemonSearchForm from "@/features/pokedex/components/PokemonSearchForm";
import type { PokemonInfo } from "@/features/pokedex/types";
import type { PokemonStatKey } from "@/features/stat-calculator/types";

// 親コンポーネント側で管理するステータスデータの型
// evs は PokemonStatKey（hp, attack, ...）をそのままキーに使う。
// H/A/B/C/D/S 形式への変換はどこにも依存していないため不要。
interface UpdatedStatusData {
    pokemon_id?: number;
    pokemon_name?: string;
    nature?: string;
    evs?: Record<PokemonStatKey, number>;
}

export default function TrainedManagementPage() {
    const [currentStatus, setCurrentStatus] = useState<UpdatedStatusData | null>(null);
    
    // 検索フォーム用の状態管理
    const [pokemon, setPokemon] = useState<PokemonInfo | null>(null);
    const [error, setError] = useState<string | null>(null);

    // 検索開始時のリセット処理
    const handleSearchStart = () => {
        setError(null);
        setPokemon(null);
    };

    // フォーム内でポケモンや努力値が変更されたときに実行されるコールバック    
    const handleStatusUpdate = useCallback((data: UpdatedStatusData) => {
        setCurrentStatus(data);
    }, []);
    
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">ステータス計算</h1>
                    <p className="text-sm text-slate-400 mt-1">ポケモンの努力値調整と実数値の計算を行います</p>
                </div>
            </header>

            <main className="space-y-6">
                {/* 検索フォームエリア */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">
                        ポケモンを検索
                    </label>
                    <PokemonSearchForm 
                        onSearchStart={handleSearchStart}
                        onSearchSuccess={setPokemon}
                        onSearchError={setError}
                    />
                    
                    {/* 検索エラー表示 */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-950/50 border-l-4 border-red-500 text-red-200 rounded-r text-sm">
                            <p className="font-bold">エラー</p>
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                {/* 検索結果を StatForm に渡す */}
                <StatForm 
                    pokemon={pokemon}
                    onStatusUpdate={handleStatusUpdate} 
                />
            </main>
        </div>
    );
}