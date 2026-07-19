// frontend/features/matchup-filter/components/MatchupFilterSection.tsx
"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import type { ComplementaryPokemon } from "@/features/type-complement/types";
import { useMatchupFilter } from "../hooks/useMatchupFilter";
import type { FilteredCandidate } from "../types";
import type { MatrixResultRow } from "@/features/TopTierMatchups/types";

interface MatchupFilterSectionProps {
    complements: ComplementaryPokemon[];
    targets: MatrixResultRow[];
    onFilterComplete?: (result: FilteredCandidate[]) => void;
}

export default function MatchupFilterSection({
    complements,
    targets,
    onFilterComplete,
}: MatchupFilterSectionProps) {
    const { filteredCandidates, isLoading, error, runFilter } = useMatchupFilter();

    // フィルターのON/OFF状態を管理するState（デフォルトはON）
    const [isStrictFilterEnabled, setIsStrictFilterEnabled] = useState(true);

    const onFilterCompleteRef = useRef(onFilterComplete);

    useEffect(() => {
        onFilterCompleteRef.current = onFilterComplete;
    }, [onFilterComplete]);

    const handleClick = () => {
        runFilter(complements, targets);
    };

    // 1. ターゲット（横軸）を「×」優先で並び替える
    const sortedTargets = useMemo(() => {
        return [...targets].sort((a, b) => {
            if (a.judgment === "×" && b.judgment !== "×") return -1;
            if (a.judgment !== "×" && b.judgment === "×") return 1;
            return (a.opponent_rank || 999) - (b.opponent_rank || 999);
        });
    }, [targets]);

    // 2. 「×に対して-」のものを除外し、有利判定の数と内訳で並び替える
    const sortedCandidates = useMemo(() => {
        if (!filteredCandidates) return null;

        let processedCandidates = [...filteredCandidates];

        // 厳密フィルターがONの場合のみ、足切り（除外処理）を実行
        if (isStrictFilterEnabled) {
            processedCandidates = processedCandidates.filter(candidate => {
                const hasDashAgainstCross = sortedTargets.some(target => {
                    return target.judgment === "×" && !candidate.good_matchups.some(
                        (matchup: any) => matchup.opponent_name === target.opponent_name
                    );
                });
                return !hasDashAgainstCross;
            });
        }

        return processedCandidates
            .map(candidate => {
                // 記号ごとの内訳を集計
                const matchBreakdown = { "◎": 0, "◯": 0, "△": 0 };
                let matchCount = 0;

                sortedTargets.forEach(target => {
                    const matchup: any = candidate.good_matchups.find(
                        (m: any) => m.opponent_name === target.opponent_name
                    );
                    if (matchup) {
                        matchCount++;
                        if (matchup.judgment === "◎") matchBreakdown["◎"]++;
                        else if (matchup.judgment === "◯") matchBreakdown["◯"]++;
                        else if (matchup.judgment === "△") matchBreakdown["△"]++;
                    }
                });

                return { ...candidate, matchCount, matchBreakdown };
            })
            .sort((a, b) => {
                // 1. まずカバー総数で比較
                if (b.matchCount !== a.matchCount) {
                    return b.matchCount - a.matchCount;
                }
                // 2. 総数が同じなら、◎の数で比較
                if (b.matchBreakdown["◎"] !== a.matchBreakdown["◎"]) {
                    return b.matchBreakdown["◎"] - a.matchBreakdown["◎"];
                }
                // 3. ◎の数も同じなら、◯の数で比較
                if (b.matchBreakdown["◯"] !== a.matchBreakdown["◯"]) {
                    return b.matchBreakdown["◯"] - a.matchBreakdown["◯"];
                }
                // 4. 最後にランク順
                return (a.rank || 999) - (b.rank || 999);
            });
    }, [filteredCandidates, sortedTargets, isStrictFilterEnabled]);

    // 親へのコールバック送信
    useEffect(() => {
        if (sortedCandidates) {
            onFilterCompleteRef.current?.(sortedCandidates);
        }
    }, [sortedCandidates]);

    return (
        <section className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                        苦手な相手で絞り込む
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        主軸の「×」をカバーできる候補を確認します
                    </p>
                    
                    {/* フィルター切り替え用のチェックボックス */}
                    <div className="mt-3">
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isStrictFilterEnabled}
                                onChange={(e) => setIsStrictFilterEnabled(e.target.checked)}
                                className="w-4 h-4 text-slate-900 bg-gray-100 border-gray-300 rounded focus:ring-slate-900 focus:ring-2"
                            />
                            <span className="ml-2 text-sm font-medium text-slate-700">
                                すべての「×」をカバーできない候補を除外する
                            </span>
                        </label>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleClick}
                    disabled={isLoading || complements.length === 0 || targets.length === 0}
                    className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                    {isLoading ? "処理中…" : "この条件で実行する"}
                </button>
            </div>

            {error && (
                <div className="p-4 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm">
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {sortedCandidates &&
                (sortedCandidates.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
                        {isStrictFilterEnabled 
                            ? "すべての「×」をカバーできる候補が見つかりませんでした。チェックを外すと全候補を確認できます。" 
                            : "候補が見つかりませんでした。"}
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
                        <table className="min-w-full border-collapse text-sm">
                            <thead>
                                <tr>
                                    <th className="sticky left-0 z-10 bg-slate-50 px-4 py-2.5 text-left font-medium text-slate-600 border-b border-r border-slate-200 whitespace-nowrap">
                                        候補ポケモン <span className="text-xs text-slate-400 font-normal ml-1">(有利な数)</span>
                                    </th>
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
                                        <td className="sticky left-0 z-10 bg-inherit px-4 py-3 border-r border-b border-slate-200 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="font-medium text-slate-900">
                                                    {candidate.name}
                                                </span>
                                                <span className="ml-2 text-xs text-slate-400">
                                                    Rank {candidate.rank}
                                                </span>
                                            </div>
                                            
                                            {/* 各記号の集計バッジ表示 */}
                                            <div className="flex gap-1 mt-1.5">
                                                {candidate.matchBreakdown["◎"] > 0 && (
                                                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-200">
                                                        ◎ {candidate.matchBreakdown["◎"]}
                                                    </span>
                                                )}
                                                {candidate.matchBreakdown["◯"] > 0 && (
                                                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200">
                                                        ◯ {candidate.matchBreakdown["◯"]}
                                                    </span>
                                                )}
                                                {candidate.matchBreakdown["△"] > 0 && (
                                                    <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded border border-amber-200">
                                                        △ {candidate.matchBreakdown["△"]}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        {sortedTargets.map((target) => {
                                            // 該当するターゲットの判定データを取得
                                            const matchupData: any = candidate.good_matchups.find(
                                                (m: any) => m.opponent_name === target.opponent_name
                                            );
                                            
                                            const judgmentMark = matchupData ? matchupData.judgment : "-";
                                            
                                            // 判定記号ごとに文字色を変える
                                            let textColorClass = "text-slate-300";
                                            if (judgmentMark === "◎") {
                                                textColorClass = "text-blue-800 font-bold";
                                            } else if (judgmentMark === "◯") {
                                                textColorClass = "text-green-800 font-semibold";
                                            } else if (judgmentMark === "△") {
                                                textColorClass = "text-amber-800 font-medium";
                                            }

                                            return (
                                                <td
                                                    key={target.opponent_name}
                                                    className={`px-4 py-2.5 text-center border-b border-slate-200 ${textColorClass}`}
                                                >
                                                    {judgmentMark}
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