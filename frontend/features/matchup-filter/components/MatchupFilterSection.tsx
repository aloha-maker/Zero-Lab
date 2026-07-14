// frontend/features/matchup-filter/components/MatchupFilterSection.tsx
"use client";

import { useEffect, useRef, useMemo } from "react";
import type { ComplementaryPokemon } from "@/features/type-complement/types";
import { useMatchupFilter } from "../hooks/useMatchupFilter";
import type { FilteredCandidate } from "../types";
import type { MatrixResultRow } from "@/features/TopTierMatchups/types";

interface MatchupFilterSectionProps {
    /** 相性補完候補（① ステップの結果） */
    complements: ComplementaryPokemon[];
    /** 既存の MatrixResultRow 型を使用する */
    targets: MatrixResultRow[];
    /** 絞り込み結果を親に渡すコールバック */
    onFilterComplete?: (result: FilteredCandidate[]) => void;
}

export default function MatchupFilterSection({
    complements,
    targets,
    onFilterComplete,
}: MatchupFilterSectionProps) {
    const { filteredCandidates, isLoading, error, runFilter } = useMatchupFilter();

    const onFilterCompleteRef = useRef(onFilterComplete);

    useEffect(() => {
        onFilterCompleteRef.current = onFilterComplete;
    }, [onFilterComplete]);

    useEffect(() => {
        if (filteredCandidates) {
            onFilterCompleteRef.current?.(filteredCandidates);
        }
    }, [filteredCandidates]);

    const handleClick = () => {
        runFilter(complements, targets);
    };

    // 【追加】ターゲット（横軸）を「×」優先で並び替える
    const sortedTargets = useMemo(() => {
        return [...targets].sort((a, b) => {
            // 1. "×" を優先して左側に配置
            if (a.judgment === "×" && b.judgment !== "×") return -1;
            if (a.judgment !== "×" && b.judgment === "×") return 1;
            
            // 2. 判定が同じ（両方×、両方△など）場合はランク順
            return (a.opponent_rank || 999) - (b.opponent_rank || 999);
        });
    }, [targets]);

    // ◯の数を計算し、多い順に並び替えた配列を生成する
    const sortedCandidates = useMemo(() => {
        if (!filteredCandidates) return null;

        return [...filteredCandidates].map(candidate => {
            // このテーブルに表示されているターゲットに対して、有利（◯）な数をカウント
            const matchCount = sortedTargets.filter(target =>
                candidate.good_matchups.includes(target.opponent_name)
            ).length;
            
            return { ...candidate, matchCount };
        }).sort((a, b) => {
            // 1. ◯の数が多い順（降順）
            if (b.matchCount !== a.matchCount) {
                return b.matchCount - a.matchCount;
            }
            // 2. 同点の場合はランク順（昇順＝より人気なポケモンを上へ）
            return (a.rank || 999) - (b.rank || 999);
        });
    }, [filteredCandidates, sortedTargets]);

    return (
        <section className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                        苦手な相手で絞り込む
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        主軸ポケモンが苦手なポケモン（△・×）に対して有利なポケモン
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleClick}
                    disabled={isLoading || complements.length === 0 || targets.length === 0}
                    className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? "絞り込み中…" : "この条件で絞り込む"}
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm">
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {sortedCandidates &&
                (sortedCandidates.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
                        条件を満たす候補が見つかりませんでした
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
                        <table className="min-w-full border-collapse text-sm">
                            <thead>
                                <tr>
                                    <th className="sticky left-0 z-10 bg-slate-50 px-4 py-2.5 text-left font-medium text-slate-600 border-b border-r border-slate-200 whitespace-nowrap">
                                        候補ポケモン <span className="text-xs text-slate-400 font-normal ml-1">(有利な数)</span>
                                    </th>
                                    {/* 【変更】sortedTargets をマッピング */}
                                    {sortedTargets.map((target) => (
                                        <th
                                            key={target.opponent_name}
                                            className="px-4 py-2.5 text-center font-medium text-slate-600 border-b border-slate-200 whitespace-nowrap"
                                        >
                                            <div className="flex flex-col items-center gap-1">
                                                <span>{target.opponent_name}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                                    target.judgment === "×" 
                                                        ? "bg-red-100 text-red-700" 
                                                        : "bg-amber-100 text-amber-700"
                                                }`}>
                                                    {target.judgment}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedCandidates.map((candidate) => (
                                    <tr
                                        key={candidate.id}
                                        className="odd:bg-white even:bg-slate-50/50 hover:bg-blue-50/30 transition-colors"
                                    >
                                        <td className="sticky left-0 z-10 bg-inherit px-4 py-2.5 border-r border-b border-slate-200 whitespace-nowrap">
                                            <span className="font-medium text-slate-900">
                                                {candidate.name}
                                            </span>
                                            <span className="ml-2 text-xs text-slate-400">
                                                Rank {candidate.rank}
                                            </span>
                                            <span className="ml-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                                                ◯ {candidate.matchCount}
                                            </span>
                                        </td>
                                        {/* 【変更】sortedTargets をマッピング */}
                                        {sortedTargets.map((target) => {
                                            const isGood = candidate.good_matchups.includes(
                                                target.opponent_name
                                            );
                                            return (
                                                <td
                                                    key={target.opponent_name}
                                                    className={`px-4 py-2.5 text-center border-b border-slate-200 text-red-800 ${
                                                        isGood
                                                            ? "text-emerald-600 font-semibold"
                                                            : "text-slate-300"
                                                    }`}
                                                >
                                                    {isGood ? "◯" : "-"}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
        </section>
    );
}