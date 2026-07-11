"use client";

import { useSeasonData } from "../hooks/useSeasonData";
import { PokemonTable } from "./PokemonTable";
import { DamageRankingTable } from "./DamageRankingTable";

// Propsの型定義を追加
type Step1PageProps = {
    seasonData?: ReturnType<typeof useSeasonData>;
};

export function SeasonDataPage({ seasonData: externalSeasonData }: Step1PageProps) {
    const internalSeasonData = useSeasonData();
    const activeSeasonData = externalSeasonData ?? internalSeasonData;
    // Propsからすべて展開する
    const {
        pokemonList,
        sortedPokemonList,
        realDamageRanking,
        isLoading,
        error,
        hasSearched,
        sortKey,
        sortOrder,
        handleSort,
        fetchSeasonPokemons
    } = activeSeasonData;

    return (
        <div className="p-6 w-full mx-auto bg-slate-50 min-h-screen">
            {/* ヘッダーエリア */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">環境ポケモン一覧</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        最新シーズンの環境データおよび技の通りが良いランキングを検索・確認できます。
                    </p>
                </div>
                
                {/* 検索ボタン */}
                <div className="flex-shrink-0">
                    <button
                        onClick={fetchSeasonPokemons}
                        disabled={isLoading}
                        className={`px-6 py-2.5 font-semibold text-sm rounded-xl shadow-sm text-white transition-all
                            ${isLoading 
                                ? "bg-blue-400 cursor-not-allowed" 
                                : "bg-blue-600 hover:bg-blue-700 active:scale-98"
                            }
                        `}
                    >
                        {isLoading ? "検索中..." : "データを検索する"}
                    </button>
                </div>
            </div>

            {/* ローディング表示 */}
            {isLoading && (
                <div className="flex justify-center items-center py-20 text-slate-500 text-sm">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                    最新の環境データを取得しています...
                </div>
            )}

            {/* エラー表示 */}
            {error && (
                <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                    ⚠️ エラー: {error}
                </div>
            )}

            {/* 初期表示（まだ一度も検索していない場合） */}
            {!hasSearched && !isLoading && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm">
                    💡 「データを検索する」ボタンを押すと、最新の環境データを読み込みます。
                </div>
            )}

            {/* 検索した結果、データが空の場合の表示 */}
            {hasSearched && !isLoading && !error && sortedPokemonList.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
                    対象のポケモンが見つかりませんでした。
                </div>
            )}

            {/* メインテーブル（データがある場合のみ表示） */}
            {!isLoading && !error && sortedPokemonList.length > 0 && (
                <div className="flex flex-col-reverse gap-6 w-full">
                    <PokemonTable 
                        pokemonList={pokemonList}
                        sortedPokemonList={sortedPokemonList}
                        sortKey={sortKey}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                    />
                    <DamageRankingTable 
                        realDamageRanking={realDamageRanking}
                    />
                </div>
            )}
        </div>
    );
}