// frontend/features/matchup-filter/components/MatchupFilterSection.tsx
"use client";

import { useEffect } from "react";
import type { ComplementaryPokemon } from "@/features/type-complement/types";
import { useMatchupFilter } from "../hooks/useMatchupFilter";
import { dummyTargets } from "../utils/dummyTargets";
import type { FilteredCandidate } from "../types";

interface MatchupFilterSectionProps {
    /** 相性補完候補（① ステップの結果） */
    complements: ComplementaryPokemon[];
    /** 絞り込み結果を親に渡すコールバック */
    onFilterComplete?: (result: FilteredCandidate[]) => void;
}

export default function MatchupFilterSection({
    complements,
    onFilterComplete,
}: MatchupFilterSectionProps) {
    const { filteredCandidates, isLoading, error, runFilter } = useMatchupFilter();

    // 結果が更新されたら親に通知
    useEffect(() => {
        if (filteredCandidates) {
            onFilterComplete?.(filteredCandidates);
        }
    }, [filteredCandidates, onFilterComplete]);

    const handleClick = () => {
        // TODO: dummyTargets は将来マトリクス診断機能から渡される実データに差し替える
        runFilter(complements, dummyTargets);
    };

    return (
        <section className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                        苦手な相手で絞り込む
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        △・×判定の相手に対して、実際に有利を取れる候補だけを残します
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleClick}
                    disabled={isLoading || complements.length === 0}
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

            {filteredCandidates &&
                (filteredCandidates.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
                        条件を満たす候補が見つかりませんでした
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
                        <table className="min-w-full border-collapse text-sm">
                            <thead>
                                <tr>
                                    <th className="sticky left-0 z-10 bg-slate-50 px-4 py-2.5 text-left font-medium text-slate-600 border-b border-r border-slate-200 whitespace-nowrap">
                                        候補ポケモン
                                    </th>
                                    {dummyTargets.map((target) => (
                                        <th
                                            key={target.opponent_name}
                                            className="px-4 py-2.5 text-center font-medium text-slate-600 border-b border-slate-200 whitespace-nowrap"
                                        >
                                            {target.opponent_name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCandidates.map((candidate) => (
                                    <tr
                                        key={candidate.id}
                                        className="odd:bg-white even:bg-slate-50/50"
                                    >
                                        <td className="sticky left-0 z-10 bg-inherit px-4 py-2.5 border-r border-b border-slate-200 whitespace-nowrap">
                                            <span className="font-medium text-slate-900">
                                                {candidate.name}
                                            </span>
                                            <span className="ml-2 text-xs text-slate-400">
                                                Rank {candidate.rank}
                                            </span>
                                        </td>
                                        {dummyTargets.map((target) => {
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