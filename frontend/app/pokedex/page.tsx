"use client";

import { useState } from "react";
// 変更点1: 共通の型とエラーレスポンス型をインポート
import type { PokemonInfo, ApiErrorResponse } from "@/app/types/api";

export default function PokedexPage() {
    const [searchQuery, setSearchQuery] = useState("");

    // 変更点2: バックエンドと同期した PokemonInfo 型を使用
    const [pokemon, setPokemon] = useState<PokemonInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);
        setPokemon(null);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

            // 検索クエリ（名前または図鑑番号）をパスパラメータとして送信
            const response = await fetch(`${API_URL}/api/v1/pokemon/${searchQuery.toLowerCase()}`);

            // 変更点3: ApiErrorResponse を用いた詳細なエラーハンドリング
            if (!response.ok) {
                const errorData = (await response.json()) as ApiErrorResponse;
                let errorMessage = "ポケモンの情報の取得に失敗しました";

                if (response.status === 404) {
                    errorMessage = "指定されたポケモンが見つかりませんでした";
                } else if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else if (Array.isArray(errorData.detail)) {
                    errorMessage = "入力内容に誤りがあります（" + errorData.detail.map(err => err.msg).join(", ") + "）";
                }
                throw new Error(errorMessage);
            }

            // 変更点4: レスポンスを PokemonInfo として受け取る
            const data = (await response.json()) as PokemonInfo;
            setPokemon(data);

        } catch (err: any) {
            console.error("Error:", err);
            setError(err.message || "通信エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen p-4 md:p-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">ポケモン図鑑</h1>
                    <p className="text-gray-600 mt-2">PokeAPIから取得した詳細情報を表示します</p>
                </header>

                {/* 検索フォーム */}
                <form onSubmit={handleSearch} className="mb-8 flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ポケモン名 または 図鑑番号 (例: pikachu, 25)"
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                        {loading ? "検索中..." : "検索"}
                    </button>
                </form>

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
                                        <p className="text-lg font-bold">{pokemon.height_m} m</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-1">重さ</h3>
                                        <p className="text-lg font-bold">{pokemon.weight_kg} kg</p>
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
                                    <span key={move} className="px-3 py-1 bg-white border border-gray-200 rounded text-sm text-gray-600 capitalize">
                                        {move}
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