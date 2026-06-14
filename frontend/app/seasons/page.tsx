"use client";

import { useEffect, useState } from "react";
// 1. api.ts から共通の PokemonInfo 型をインポートして再利用
import type { PokemonInfo } from "@/app/types/api";

// 2. ループ処理（.map）で効率的に回すためのステータス列定義
const STAT_COLUMNS = [
    { key: "hp", label: "HP" },
    { key: "attack", label: "攻撃" },
    { key: "defense", label: "防御" },
    { key: "sp_attack", label: "特攻" },
    { key: "sp_defense", label: "特防" },
    { key: "speed", label: "素早" },
] as const;

// FastAPIのベースURL（環境に合わせて変更してください）
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SeasonsPage() {
    // 状態管理（取得したポケモンリスト、ローディング、エラー）
    const [pokemonList, setPokemonList] = useState<PokemonInfo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSeasonPokemons = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // 先ほど作成したルーターのエンドポイントを叩く
                const res = await fetch(`${API_BASE_URL}/api/v1/seasons/latest_pokemons`);
                
                if (!res.ok) {
                    throw new Error("データの取得に失敗しました");
                }
                
                const data: PokemonInfo[] = await res.json();
                setPokemonList(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "予期せぬエラーが発生しました");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSeasonPokemons();
    },[]);

    return (
        <div className="p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">環境ポケモン一覧</h1>
                <p className="text-slate-500 text-sm mt-1">
                    現在の環境）で利用可能なポケモンのステータス一覧です。
                </p>
            </div>

            {/* ローディング表示 */}
            {isLoading && (
                <div className="flex justify-center items-center py-12 text-slate-500 text-sm">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                    データを読み込み中...
                </div>
            )}

            {/* エラー表示 */}
            {error && (
                <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                    ⚠️ エラー: {error}
                </div>
            )}

            {/* データが空の場合の表示 */}
            {!isLoading && !error && pokemonList.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
                    対象のポケモンが見つかりませんでした。
                </div>
            )}

            {/* メインテーブル（データがある場合のみ表示） */}
            {!isLoading && !error && pokemonList.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-sm">
                                    <th className="px-4 py-3 font-semibold text-slate-900 w-24">図鑑番号</th>
                                    <th className="px-4 py-3 font-semibold text-slate-900 w-44">名前</th>
                                    <th className="px-4 py-3 font-semibold text-slate-900 w-48">タイプ</th>
                                    {STAT_COLUMNS.map((col) => (
                                        <th key={col.key} className="px-4 py-3 font-semibold text-slate-900">
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 text-sm">
                                {pokemonList.map((pokemon) => (
                                    <tr key={pokemon.id} className="hover:bg-blue-50/50 transition-colors">
                                        {/* 図鑑番号 */}
                                        <td className="px-4 py-4 font-mono text-slate-500">
                                            #{String(pokemon.id).padStart(3, '0')}
                                        </td>

                                        {/* 名前 */}
                                        <td className="px-4 py-4 font-bold text-slate-900">
                                            <div className="flex items-center gap-3">
                                                {/* APIから返ってくる画像URLを表示 */}
                                                {pokemon.image_url && (
                                                    <img 
                                                        src={pokemon.image_url} 
                                                        alt={pokemon.name} 
                                                        className="w-10 h-10 object-contain bg-slate-50 rounded"
                                                        loading="lazy"
                                                    />
                                                )}
                                                <div>
                                                    <div>{pokemon.name}</div>
                                                    <div className="text-xs text-slate-400 font-normal capitalize">{pokemon.english_name}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* タイプ */}
                                        <td className="px-4 py-4">
                                            <div className="flex gap-1.5">
                                                {pokemon.types.map((type) => (
                                                    <span key={type} className="inline-block px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                                        {type}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>

                                        {/* 種族値 */}
                                        {STAT_COLUMNS.map((col) => {
                                            // FastAPI側でsp_attackが「special-attack」などハイフンで返ってくるケースや、
                                            // 逆のケースに対応するため、キーのブレを吸収するフォールバックを噛ませておくと安全です。
                                            const statKey = col.key === "sp_attack" ? "special-attack" : col.key === "sp_defense" ? "special-defense" : col.key;
                                            const score = pokemon.base_stats[col.key] ?? pokemon.base_stats[statKey] ?? "-";
                                            
                                            return (
                                                <td key={col.key} className="px-4 py-4 font-mono font-bold text-slate-800">
                                                    {score}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}