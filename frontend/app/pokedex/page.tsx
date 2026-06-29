"use client";

import { useState } from "react";
import type { PokemonInfo } from "@/app/types/api";
import PokemonSearchForm from "./components/PokemonSearchForm"; 

export default function PokedexPage() {
    const [pokemon, setPokemon] = useState<PokemonInfo | null>(null);
    const [error, setError] = useState<string | null>(null);

    // 検索が始まったら、前の状態をクリアする
    const handleSearchStart = () => {
        setError(null);
        setPokemon(null);
    };

    // 検索成功時の処理
    const handleSearchSuccess = (data: PokemonInfo) => {
        setPokemon(data);
    };

    // 検索失敗時の処理
    const handleSearchError = (message: string) => {
        setError(message);
    };

    return (
        <main className="min-h-screen p-4 md:p-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">ポケモン図鑑</h1>
                    <p className="text-gray-600 mt-2">PokeAPIから取得した詳細情報を表示します</p>
                </header>

                {/* 検索ロジックを内包したコンポーネント */}
                <PokemonSearchForm 
                    onSearchStart={handleSearchStart}
                    onSearchSuccess={handleSearchSuccess}
                    onSearchError={handleSearchError}
                />

                {/* エラー表示 */}
                {error && (
                    <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-sm">
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {/* 検索結果表示 */}
                {pokemon && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                        {/* ヘッダー部分 */}
                        <div className="bg-blue-600 p-6 text-white flex flex-col md:flex-row items-center gap-6">
                            {pokemon.image_url && (
                                <div className="bg-white p-2 rounded-full shadow-inner">
                                    <img src={pokemon.image_url} alt={pokemon.name} className="w-32 h-32 object-contain" />
                                </div>
                            )}
                            <div className="text-center md:text-left">
                                <span className="text-blue-200 font-mono text-xl">No.{String(pokemon.id).padStart(3, '0')}</span>
                                <h2 className="text-4xl font-black capitalize">{pokemon.name}</h2>
                                <p className="text-blue-100 opacity-80 uppercase tracking-widest">{pokemon.english_name}</p>
                            </div>
                        </div>

                        {/* 詳細スペック */}
                        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* 基本データ */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">タイプ</h3>
                                    <div className="flex gap-2">
                                        {pokemon.types.map(type => (
                                            <span key={type} className="px-4 py-1 rounded-full bg-gray-100 text-gray-700 font-bold capitalize border border-gray-200">
                                                {type}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">特性</h3>
                                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                                        {pokemon.abilities.map(ability => (
                                            <li key={ability} className="capitalize">{ability}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex gap-8">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-1">高さ</h3>
                                        <p className="text-lg font-bold text-gray-400">{pokemon.height_m} m</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-1">重さ</h3>
                                        <p className="text-lg font-bold text-gray-400">{pokemon.weight_kg} kg</p>
                                    </div>
                                </div>
                            </div>

                            {/* 種族値グラフ風表示 */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">種族値 (Base Stats)</h3>
                                <div className="space-y-3">
                                    {Object.entries(pokemon.base_stats).map(([stat, value]) => (
                                        <div key={stat}>
                                            <div className="flex justify-between text-xs font-bold mb-1 uppercase text-gray-600">
                                                <span>{stat}</span>
                                                <span>{value}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.min(100, (value / 255) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 覚える技（一部のみ表示） */}
                        <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-200">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">覚える技 (主要な技)</h3>
                            <div className="flex flex-wrap gap-2">
                                {pokemon.moves.slice(0, 15).map(move => (
                                    <span key={move.name} className="px-3 py-1 bg-white border border-gray-200 rounded text-sm text-gray-600 capitalize">
                                        {move.name}
                                    </span>
                                ))}
                                {pokemon.moves.length > 15 && <span className="text-gray-400 text-sm italic py-1">and more...</span>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}