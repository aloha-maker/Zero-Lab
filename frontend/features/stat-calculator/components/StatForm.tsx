// frontend/features/stat-calculator/components/StatForm.tsx
"use client";

import React, { useEffect } from "react";
import { NATURES, EV_MAX_PER_STAT, EV_TOTAL_MAX } from "@/features/stat-calculator/types";
import { STAT_KEYS, type StatusCalcProps } from "../types";
import { usePokemonStats } from "../hooks/usePokemonStats";
import type { PokemonInfo } from "@/features/pokedex/types";

// 既存の StatusCalcProps を拡張して pokemon を受け取れるようにする
interface ExtendedStatusCalcProps extends StatusCalcProps {
    pokemon?: PokemonInfo | null;
}

export default function StatForm(props: ExtendedStatusCalcProps) {
    const {
        currentPokemonName,
        natureIndex,
        setNatureIndex,
        stats,
        results,
        isLoading,
        handleSearchSuccess,
        handleStatChange,
        handleCalculate,
        currentEVTotal
    } = usePokemonStats(props);

    // 親から渡された pokemon データが変更されたら、内部ステータスを更新する
    // handleSearchSuccess は usePokemonStats 内で useCallback 化されているため、
    // props.pokemon が実際に変わったときだけ発火する
    useEffect(() => {
        if (props.pokemon) {
            handleSearchSuccess(props.pokemon);
        }
    }, [props.pokemon, handleSearchSuccess]);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 text-slate-100">

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

            {/* ステータス入力テーブル（変更なしのため省略） */}
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
                            const selectedNature = NATURES[natureIndex];

                            // up/down が PokemonStatKey を直接持つため、NATURE_MAP経由の変換は不要
                            const isUp = selectedNature.up === key;
                            const isDown = selectedNature.down === key;

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
                                                max={EV_MAX_PER_STAT}
                                                step={1}
                                                value={stats[key].ev}
                                                onChange={(e) => handleStatChange(key, 'ev', parseInt(e.target.value) || 0)}
                                                className="flex-1 accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer hidden md:block"
                                            />
                                            <input
                                                type="number"
                                                min={0}
                                                max={EV_MAX_PER_STAT}
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

            {/* フッター・計算ボタンエリア（変更なしのため省略） */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="w-full sm:w-auto flex-1 max-w-sm">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-1.5">
                        <span>努力値の合計配分</span>
                        <span className={`${currentEVTotal > EV_TOTAL_MAX ? 'text-red-400' : 'text-slate-300'}`}>
                            {currentEVTotal} / {EV_TOTAL_MAX}
                        </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${
                                currentEVTotal > EV_TOTAL_MAX ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-pink-500'
                            }`}
                            style={{ width: `${Math.min(100, (currentEVTotal / EV_TOTAL_MAX) * 100)}%` }}
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