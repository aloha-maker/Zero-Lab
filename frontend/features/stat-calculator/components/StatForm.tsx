// frontend/features/stat-calculator/components/StatForm.tsx
"use client";

import React from "react";
// モーダル版からインライン版のコンポーネントに変更（必要に応じてインポートパスや名前を調整してください）
import PokemonSearchForm from "@/features/pokedex/components/PokemonSearchForm";
import { NATURES } from "@/features/stat-calculator/types";
import { STAT_KEYS, type StatusCalcProps } from "../types";
import { NATURE_MAP } from "../utils/calculateStats";
import { usePokemonStats } from "../hooks/usePokemonStats";

export default function StatForm(props: StatusCalcProps) {
    const {
        currentPokemonName,
        natureIndex,
        setNatureIndex,
        stats,
        results,
        isLoading,
        globalError,
        setIsSearchOpen,
        searchError,
        handleSearchStart,
        handleSearchSuccess,
        handleSearchError,
        handleStatChange,
        handleCalculate,
        currentEVTotal
    } = usePokemonStats(props);

    // 検索成功時のラッパー関数（検索が完了したらインライン検索UIを閉じる）
    const onSearchSuccessInline = (data: any) => {
        handleSearchSuccess(data);
        setIsSearchOpen(false);
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 text-slate-100">
            {/* 検索 */}
            <div className="mb-5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">
                    ポケモンを検索
                </label>
                <PokemonSearchForm
                    onSearchStart={handleSearchStart}
                    onSearchSuccess={handleSearchSuccess}
                    onSearchError={handleSearchError}
                />
            </div>

            {/* 選択中ポケモン・性格 */}
            <div className="flex items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-800">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 truncate">
                    {currentPokemonName || "未選択"}
                </h2>

                <div className="w-40 shrink-0">
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">性格</label>
                    <select
                        value={natureIndex}
                        onChange={(e) => setNatureIndex(Number(e.target.value))}
                        className="w-full border border-slate-800 rounded-lg p-2 bg-slate-950 text-slate-100 text-sm outline-none focus:border-indigo-500"
                    >
                        {NATURES.map((n, i) => (
                            <option key={i} value={i}>{n.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* エラー表示 */}
            {globalError && (
                <div className="mb-5 p-4 bg-red-950/50 border-l-4 border-red-500 text-red-200 rounded-r text-sm">
                    <p className="font-bold">エラー</p>
                    <p>{globalError}</p>
                </div>
            )}

            {/* ステータス入力テーブル */}
            <div className="overflow-x-auto mb-6 border border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                        <tr className="bg-slate-950/60 text-slate-500 text-xs uppercase tracking-wide">
                            <th className="p-3 border-b border-slate-800 font-bold w-1/5">ステータス</th>
                            <th className="p-3 border-b border-slate-800 font-bold text-center w-1/5">種族値</th>
                            <th className="p-3 border-b border-slate-800 font-bold text-center w-2/5">努力値</th>
                            <th className="p-3 border-b border-slate-800 font-bold text-center w-1/5">実数値</th>
                        </tr>
                    </thead>
                    <tbody>
                        {STAT_KEYS.map(key => {
                            const natureChar = NATURE_MAP[key];
                            const selectedNature = NATURES[natureIndex];
                            
                            const isUp = key !== 'hp' && selectedNature.up === natureChar;
                            const isDown = key !== 'hp' && selectedNature.down === natureChar;

                            return (
                                <tr key={key} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40 transition-colors">
                                    <td className="p-3 font-bold text-slate-200 uppercase text-xs tracking-wider">
                                        {key}
                                        {isUp && <span className="text-red-400 ml-1">▲</span>}
                                        {isDown && <span className="text-blue-400 ml-1">▼</span>}
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            type="number" 
                                            value={stats[key].base} 
                                            disabled
                                            className="w-full border border-slate-800 rounded p-1.5 text-center outline-none text-slate-500 bg-slate-950 cursor-not-allowed"
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
                                        <div className="bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 font-extrabold text-xl py-1 rounded-lg min-h-[36px] flex items-center justify-center">
                                            {results[key] !== null ? results[key] : <span className="text-indigo-900">-</span>}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* フッター・計算ボタンエリア */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="w-full sm:w-auto flex-1 max-w-sm">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-1.5">
                        <span>努力値の合計配分</span>
                        <span className={`${currentEVTotal > 66 ? 'text-red-400' : 'text-slate-300'}`}>
                            {currentEVTotal} / 66
                        </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${
                                currentEVTotal > 66 ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-pink-500'
                            }`}
                            style={{ width: `${Math.min(100, (currentEVTotal / 66) * 100)}%` }}
                        ></div>
                    </div>
                </div>
                <button
                    onClick={handleCalculate}
                    disabled={isLoading}
                    className="w-full sm:w-auto min-w-[120px] bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 active:transform active:scale-[0.99] whitespace-nowrap"
                >
                    {isLoading ? "計算中..." : "計算する"}
                </button>
            </div>
        </div>
    );
}