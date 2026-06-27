"use client";

import { useState, useEffect, useRef } from "react";
import type { PokemonInfo,StatusRequest, StatusResponse, ApiErrorResponse } from "@/app/types/api";
import { NATURES, API_URL,LEVEL,INDIVIDUAL_VALUE } from "@/app/types/constants";
import PokemonSearchForm from "../../pokedex/components/PokemonSearchForm";

// ==========================================
// TYPES & INTERFACES
// ==========================================
type StatType = 'H' | 'A' | 'B' | 'C' | 'D' | 'S';

export interface BaseStats {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
}

const statLabels: Record<StatType, string> = { 
    H: "HP", A: "攻撃", B: "防御", C: "特攻", D: "特防", S: "素早さ" 
};

// BaseStats型からStatTypeレコードへのマッピングヘルパー
const mapBaseStatsToRecord = (base?: BaseStats) => ({
    H: { base: base?.hp ?? 108, ev: 0 },
    A: { base: base?.atk ?? 130, ev: 0 },
    B: { base: base?.def ?? 95,  ev: 0 },
    C: { base: base?.spa ?? 80,  ev: 0 },
    D: { base: base?.spd ?? 85,  ev: 0 },
    S: { base: base?.spe ?? 102, ev: 0 },
});

const convertToBaseStats = (pokemon: PokemonInfo): BaseStats => {
    return {
        hp: pokemon.base_stats["hp"] ?? 0,
        atk: pokemon.base_stats["attack"] ?? 0,
        def: pokemon.base_stats["defense"] ?? 0,
        spa: pokemon.base_stats["special-attack"] ?? 0,
        spd: pokemon.base_stats["special-defense"] ?? 0,
        spe: pokemon.base_stats["speed"] ?? 0,
    };
};

// ==========================================
// Props
// ==========================================
interface StatusCalcProps {
    // 他のページから初期値を入れたい場合のためにオプションで残しておきます
    initialBaseStats?: BaseStats;
    initialPokemonName?: string;
}

// ==========================================
// DEFAULT FUNCTION
// ==========================================
export default function StatusCalc({ 
    initialBaseStats,
    initialPokemonName = "ガブリアス"
}: StatusCalcProps) {

    // 検索されたポケモン情報を内部で管理
    const [pokemon, setPokemon] = useState<PokemonInfo | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    // ポケモン名
    const currentPokemonName = pokemon?.name ?? initialPokemonName;
    
    // 性格設定 (初期値: ようき)
    const [natureIndex, setNatureIndex] = useState(18); 

    // 各ステータスの状態管理
    const [stats, setStats] = useState(() => mapBaseStatsToRecord(initialBaseStats));

    // 計算結果
    const [results, setResults] = useState<Record<StatType, number | null>>({
        H: null, A: null, B: null, C: null, D: null, S: null
    });
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);

    // ダイアログの開閉制御
    useEffect(() => {
        if (isSearchOpen) {
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [isSearchOpen]);

    // 内部で管理しているポケモンデータ、またはPropsの初期値が変わったらステータスを更新
    useEffect(() => {
        if (pokemon) {
            const base = convertToBaseStats(pokemon);
            setStats(mapBaseStatsToRecord(base));
        } else {
            setStats(mapBaseStatsToRecord(initialBaseStats));
        }
        setResults({ H: null, A: null, B: null, C: null, D: null, S: null });
    }, [pokemon, initialBaseStats]);

    // 検索フォーム用のイベントハンドラー
    const handleSearchStart = () => {
        setSearchError(null);
    };

    const handleSearchSuccess = (data: PokemonInfo) => {
        setPokemon(data);
        setIsSearchOpen(false); // 検索成功時にダイアログを閉じる
    };

    const handleSearchError = (message: string) => {
        setSearchError(message);
    };

    // 入力変更ハンドラ
    const handleStatChange = (stat: StatType, field: 'base' | 'ev', value: number) => {
        setStats(prev => ({
            ...prev,
            [stat]: { ...prev[stat], [field]: value }
        }));
    };

    // 努力値の合計値を計算
    const currentEVTotal = (Object.keys(stats) as StatType[]).reduce(
        (sum, key) => sum + stats[key].ev, 0
    );

    // 一括計算処理
    const handleCalculate = async () => {
        setIsLoading(true);
        setGlobalError(null);

        const selectedNature = NATURES[natureIndex];

        try {
            const promises = (Object.keys(stats) as StatType[]).map(async (key) => {
                let modifier = 1.0;
                if (key !== 'H') {
                    if (selectedNature.up === key) modifier = 1.1;
                    if (selectedNature.down === key) modifier = 0.9;
                }

                const requestData: StatusRequest = {
                    base_stat: stats[key].base,
                    iv: INDIVIDUAL_VALUE, 
                    ev: stats[key].ev,
                    level: LEVEL, // Propsのレベルを使用
                    is_hp: key === 'H',
                    nature_modifier: modifier
                };

                const response = await fetch(`${API_URL}/api/v1/status`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestData),
                });

                if (!response.ok) {
                    const errorData = (await response.json()) as ApiErrorResponse;
                    let errorMessage = "通信エラー";
                    if (typeof errorData.detail === 'string') {
                        errorMessage = errorData.detail;
                    } else if (Array.isArray(errorData.detail)) {
                        errorMessage = errorData.detail.map(e => e.msg).join(", ");
                    }
                    throw new Error(`${statLabels[key]}: ${errorMessage}`);
                }

                const data = (await response.json()) as StatusResponse;
                return { key, val: data.real_stat };
            });

            const resArray = await Promise.all(promises);
            const newResults = { ...results };
            resArray.forEach(r => { newResults[r.key] = r.val; });
            setResults(newResults);

        } catch (error: any) {
            console.error("Error:", error);
            setGlobalError(error.message || "サーバーとの通信に失敗しました。");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 text-slate-100">
            {/* ==========================================
                共通設定エリア（ポケモン名 ＆ 性格設定）
               ========================================== */}
            <div className="mb-8 flex flex-col sm:flex-row">
                
                {/* 左側：対象ポケモン名と検索ボタン */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 truncate">
                            {currentPokemonName}
                        </h2>
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="bg-slate-900 hover:bg-slate-950 text-slate-300 border border-slate-700 hover:border-indigo-500/50 p-2 rounded-lg transition-all shadow-sm flex items-center justify-center shrink-0"
                            title="ポケモンを検索"
                            type="button"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 右側：性格選択ドロップダウン */}
                <div className="w-full sm:w-64 shrink-0">
                    <select
                        value={natureIndex}
                        onChange={(e) => setNatureIndex(Number(e.target.value))}
                        className="w-full border border-slate-700 rounded-lg p-2 bg-slate-900 text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm"
                    >
                        {NATURES.map((n, i) => (
                            <option key={i} value={i}>{n.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ステータス入力テーブル */}
            <div className="overflow-x-auto mb-8">
                <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                        <tr className="bg-slate-800 text-slate-300 text-sm">
                            <th className="p-3 border-b border-slate-700 font-bold w-1/5">ステータス</th>
                            <th className="p-3 border-b border-slate-700 font-bold text-center w-1/5">種族値</th>
                            <th className="p-3 border-b border-slate-700 font-bold text-center w-2/5">努力値</th>
                            <th className="p-3 border-b border-slate-700 font-bold text-center w-1/5">実数値</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(Object.keys(stats) as StatType[]).map(key => {
                            return (
                                <tr key={key} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors">
                                    <td className="p-3 font-bold text-slate-200">{statLabels[key]}</td>
                                    <td className="p-2">
                                        <input 
                                            type="number" 
                                            value={stats[key].base} 
                                            disabled
                                            className="w-full border border-slate-800 rounded p-1.5 text-center outline-none text-slate-400 bg-slate-950 cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <div className="flex items-center gap-2 justify-center">
                                            <input
                                                type="range"
                                                min={0}
                                                max={32}
                                                step={1}
                                                value={stats[key].ev}
                                                onChange={(e) => handleStatChange(key, 'ev', parseInt(e.target.value) || 0)}
                                                className="flex-1 accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer hidden md:block"
                                            />
                                            <input
                                                type="number"
                                                min={0}
                                                max={32}
                                                step={1}
                                                value={stats[key].ev}
                                                onChange={(e) => handleStatChange(key, 'ev', parseInt(e.target.value) || 0)}
                                                className="w-16 text-center bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg py-1 text-xs font-bold text-slate-100 focus:outline-none"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="bg-indigo-950/50 border border-indigo-500/30 text-indigo-400 font-extrabold text-xl py-1 rounded-lg min-h-[36px] flex items-center justify-center">
                                            {results[key] !== null ? results[key] : <span className="text-indigo-900">-</span>}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* フッター集計バー */}
            <div className="bg-slate-850/60 px-6 py-4 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="w-full sm:w-auto flex-1 max-w-sm">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-1.5">
                    <span>努力値の合計配分</span>
                    <span className={`${currentEVTotal > 66 ? 'text-red-400' : 'text-slate-200'}`}>
                    {currentEVTotal} / 66
                    </span>
                </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/60">
                        <div
                        className={`h-full rounded-full transition-all duration-300 ${
                            currentEVTotal > 66 ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-pink-500'
                        }`}
                        style={{ width: `${Math.min(100, (currentEVTotal / 66) * 100)}%` }}
                        ></div>
                    </div>
                </div>
                {/* 計算ボタンをこちらへ移動 */}
                <button
                    onClick={handleCalculate}
                    disabled={isLoading}
                    className="w-full sm:w-auto min-w-[120px] bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-base hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 active:transform active:scale-[0.99] whitespace-nowrap"
                >
                    {isLoading ? "計算中..." : "計算する"}
                </button>

            </div>
            

            {/* エラーメッセージ */}
            {globalError && (
                <div className="mb-6 p-4 bg-red-950/50 border-l-4 border-red-500 text-red-200 rounded-r">
                    <p className="font-bold">エラー</p>
                    <p>{globalError}</p>
                </div>
            )}

            {/* ==========================================
                内包された検索ポップアップダイアログ (Modal)
               ========================================== */}
            <dialog
                ref={dialogRef}
                onClose={() => setIsSearchOpen(false)}
                className="fixed inset-0 m-auto backdrop:bg-slate-950/70 bg-slate-900 border border-slate-800 text-slate-100 p-6 rounded-2xl max-w-md w-11/12 sm:w-full shadow-2xl outline-none"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-200">ポケモンの検索</h3>
                    <button 
                        onClick={() => setIsSearchOpen(false)}
                        className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                        type="button"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 検索フォームコンポーネント */}
                <PokemonSearchForm 
                    onSearchStart={handleSearchStart}
                    onSearchSuccess={handleSearchSuccess}
                    onSearchError={handleSearchError}
                />

                {/* 検索フォームのエラーメッセージ */}
                {searchError && (
                    <div className="mt-4 p-3 bg-red-950/50 border-l-4 border-red-500 text-red-200 text-sm rounded">
                        <p>{searchError}</p>
                    </div>
                )}
            </dialog>

        </div>
    );
}