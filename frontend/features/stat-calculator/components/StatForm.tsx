"use client";

import React from "react";
import PokemonSearchModal from "@/features/pokedex/components/PokemonSearchModal";
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
        isSearchOpen,
        setIsSearchOpen,
        searchError,
        handleSearchStart,
        handleSearchSuccess,
        handleSearchError,
        handleStatChange,
        handleCalculate,
        currentEVTotal
    } = usePokemonStats(props);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 text-slate-100">
            {/* ヘッダーエリア */}
            <div className="mb-8 flex flex-col sm:flex-row">
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
                        {STAT_KEYS.map(key => {
                            const natureChar = NATURE_MAP[key];
                            const selectedNature = NATURES[natureIndex];
                            
                            const isUp = key !== 'hp' && selectedNature.up === natureChar;
                            const isDown = key !== 'hp' && selectedNature.down === natureChar;

                            return (
                                <tr key={key} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors">
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
                                            className="w-full border border-slate-800 rounded p-1.5 text-center outline-none text-slate-400 bg-slate-950 cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <div className="flex items-center gap-2 justify-center">
                                            <input
                                                type="range"
                                                min={0}
                                                max={32} // ※仕様によっては252等に変更
                                                step={1}
                                                value={stats[key].ev}
                                                onChange={(e) => handleStatChange(key, 'ev', parseInt(e.target.value) || 0)}
                                                className="flex-1 accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer hidden md:block"
                                            />
                                            <input
                                                type="number"
                                                min={0}
                                                max={32} // ※仕様によっては252等に変更
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

            {/* フッター・計算ボタンエリア */}
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
                <button
                    onClick={handleCalculate}
                    disabled={isLoading}
                    className="w-full sm:w-auto min-w-[120px] bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-base hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 active:transform active:scale-[0.99] whitespace-nowrap"
                >
                    {isLoading ? "計算中..." : "計算する"}
                </button>
            </div>

            {/* エラー表示 */}
            {globalError && (
                <div className="mb-6 mt-4 p-4 bg-red-950/50 border-l-4 border-red-500 text-red-200 rounded-r">
                    <p className="font-bold">エラー</p>
                    <p>{globalError}</p>
                </div>
            )}

            {/* 検索モーダル */}
            <PokemonSearchModal 
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSearchStart={handleSearchStart}
                onSearchSuccess={handleSearchSuccess}
                onSearchError={handleSearchError}
                searchError={searchError}
            />
        </div>
    );
}