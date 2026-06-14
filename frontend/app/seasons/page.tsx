"use client";

import { useEffect, useState, useMemo } from "react";
// 1. api.ts から共通の PokemonInfo 型をインポートして再利用
import type { SeasonPokemonInfo } from "@/app/types/api";

// 2. ループ処理（.map）で効率的に回すためのステータス列定義
const STAT_COLUMNS = [
    { key: "hp", label: "HP" },
    { key: "attack", label: "攻撃" },
    { key: "defense", label: "防御" },
    { key: "sp_attack", label: "特攻" },
    { key: "sp_defense", label: "特防" },
    { key: "speed", label: "素早" },
    { key: "hp_times_defense", label: "防御指数" },
    { key: "hp_times_sp_defense", label: "特防指数" },
] as const;

// FastAPIのベースURL（環境に合わせて変更してください）
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ソート対象にできるキーの型を定義（型安全性を担保）
type SortKey = "rank" | "id" | "name" | "hp" | "attack" | "defense" | "sp_attack" | "sp_defense" | "speed"| "hp_times_defense"| "hp_times_sp_defense";
type SortOrder = "asc" | "desc";

export default function SeasonsPage() {
    // 状態管理（取得したポケモンリスト、ローディング、エラー）
    const [pokemonList, setPokemonList] = useState<SeasonPokemonInfo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 💡 ソート状態の管理（初期状態：順位の昇順）
    const [sortKey, setSortKey] = useState<SortKey>("rank");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

    useEffect(() => {
        // 開発環境における2回連続通信バグの競合を防止するコントローラー
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchSeasonPokemons = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_BASE_URL}/api/v1/seasons/latest_pokemons`, { signal });
                
                if (!res.ok) {
                    throw new Error("データの取得に失敗しました");
                }
                
                const data: SeasonPokemonInfo[] = await res.json();
                setPokemonList(data);
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    return; // 通信キャンセルの場合はエラー処理を無視
                }
                setError(err instanceof Error ? err.message : "予期せぬエラーが発生しました");
            } finally {
                if (!signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        fetchSeasonPokemons();

        return () => {
            controller.abort();
        };
    }, []); // 💡 チカチカ防止のための空配列

    // 💡 ヘッダーをクリックした時にソート順を切り替える関数
    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            // 同じキーが押されたら昇順 ⇄ 降順 を切り替え
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            // 新しいキーが押されたらまずは昇順（ただし数値系なら降順から始めたい場合は調整可能）
            setSortKey(key);
            setSortOrder("asc");
        }
    };

    // 💡 データの並び替え処理（無駄な再計算を防ぐために useMemo を使用）
    const sortedPokemonList = useMemo(() => {
        // もとの配列を壊さないようシャローコピー
        const list = [...pokemonList];
        
        return list.sort((a, b) => {
            let valA: string | number = "";
            let valB: string | number = "";

            // 各種ソートキーに応じた値の割り当て
            if (sortKey === "rank") {
                // 配列のインデックス（0から始まる番号）に+1して順位とする
                // a, b がもとの配列（Supabaseから返ってきた順番＝現在の順位）のどこにいたかを基準にする
                valA = pokemonList.indexOf(a) + 1;
                valB = pokemonList.indexOf(b) + 1;
            } else if (sortKey === "id" || sortKey === "name") {
                valA = a[sortKey];
                valB = b[sortKey];
            } else {
                // 種族値（hp, attack...）の場合
                valA = a.base_stats[sortKey] ?? 0;
                valB = b.base_stats[sortKey] ?? 0;
            }

            // 文字列比較と数値比較の分岐処理
            if (typeof valA === "string" && typeof valB === "string") {
                return sortOrder === "asc" 
                    ? valA.localeCompare(valB, "ja") 
                    : valB.localeCompare(valA, "ja");
            } else {
                return sortOrder === "asc"
                    ? (valA as number) - (valB as number)
                    : (valB as number) - (valA as number);
            }
        });
    }, [pokemonList, sortKey, sortOrder]);

    // 💡 ソートアイコンを表示するためのヘルパーコンポーネント
    const SortIcon = ({ targetKey }: { targetKey: SortKey }) => {
        if (sortKey !== targetKey) return <span className="text-slate-300 ml-1">↕</span>;
        return sortOrder === "asc" ? <span className="text-blue-500 ml-1">↑</span> : <span className="text-blue-500 ml-1">↓</span>;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">環境ポケモン一覧</h1>
                <p className="text-slate-500 text-sm mt-1">
                    現在の環境（最新シーズン順位準拠）で利用可能なポケモンのステータス一覧です。各項目をクリックすると並び替えができます。
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
            {!isLoading && !error && sortedPokemonList.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
                    対象のポケモンが見つかりませんでした。
                </div>
            )}

            {/* メインテーブル（データがある場合のみ表示） */}
            {!isLoading && !error && sortedPokemonList.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-sm select-none">
                                    {/* 💡 順位ヘッダーを追加 */}
                                    <th 
                                        className="px-4 py-3 font-semibold text-slate-900 w-20 cursor-pointer hover:bg-slate-100 transition-colors"
                                        onClick={() => handleSort("rank")}
                                    >
                                        順位 <SortIcon targetKey="rank" />
                                    </th>
                                    <th 
                                        className="px-4 py-3 font-semibold text-slate-900 w-28 cursor-pointer hover:bg-slate-100 transition-colors"
                                        onClick={() => handleSort("id")}
                                    >
                                        図鑑番号 <SortIcon targetKey="id" />
                                    </th>
                                    <th 
                                        className="px-4 py-3 font-semibold text-slate-900 w-48 cursor-pointer hover:bg-slate-100 transition-colors"
                                        onClick={() => handleSort("name")}
                                    >
                                        名前 <SortIcon targetKey="name" />
                                    </th>
                                    <th className="px-4 py-3 font-semibold text-slate-900 w-44">タイプ</th>
                                    {STAT_COLUMNS.map((col) => (
                                        <th 
                                            key={col.key} 
                                            className="px-4 py-3 font-semibold text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors"
                                            onClick={() => handleSort(col.key)}
                                        >
                                            {col.label} <SortIcon targetKey={col.key} />
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 text-sm">
                                {sortedPokemonList.map((pokemon) => {
                                    // 💡 元のデータの並び順（配列内のindex）から順位を計算
                                    const currentRank = pokemonList.indexOf(pokemon) + 1;

                                    return (
                                        <tr key={pokemon.id} className="hover:bg-blue-50/50 transition-colors">
                                            {/* 💡 順位の表示（トップ3はゴールド・シルバー・ブロンズ風バッジに） */}
                                            <td className="px-4 py-4 font-bold">
                                                {currentRank === 1 && <span className="inline-flex items-center justify-center w-6 height-6 rounded-full bg-amber-100 text-amber-700 text-xs">1</span>}
                                                {currentRank === 2 && <span className="inline-flex items-center justify-center w-6 height-6 rounded-full bg-slate-200 text-slate-700 text-xs">2</span>}
                                                {currentRank === 3 && <span className="inline-flex items-center justify-center w-6 height-6 rounded-full bg-orange-100 text-orange-700 text-xs">3</span>}
                                                {currentRank > 3 && <span className="text-slate-500 font-mono pl-1.5">{currentRank}</span>}
                                            </td>

                                            {/* 図鑑番号 */}
                                            <td className="px-4 py-4 font-mono text-slate-500">
                                                #{String(pokemon.id).padStart(3, '0')}
                                            </td>

                                            {/* 名前 */}
                                            <td className="px-4 py-4 font-bold text-slate-900">
                                                <div className="flex items-center gap-3">
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
                                                const score = pokemon.base_stats[col.key] ?? "-";
                                                
                                                return (
                                                    <td key={col.key} className="px-4 py-4 font-mono font-bold text-slate-800">
                                                        {score}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}