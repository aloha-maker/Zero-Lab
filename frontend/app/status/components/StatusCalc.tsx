"use client";

import { useState, useEffect } from "react";
import type { StatusRequest, StatusResponse, ApiErrorResponse } from "@/app/types/api";
import { NATURES, API_URL,LEVEL,INDIVIDUAL_VALUE } from "@/app/types/constants";

// ==========================================
// TYPES & INTERFACES
// ==========================================
type StatType = 'H' | 'A' | 'B' | 'C' | 'D' | 'S';

interface BaseStats {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
}

// ==========================================
// 親コンポーネントから受け取る Props の定義
// ==========================================
interface StatusCalcProps {
    initialBaseStats?: BaseStats;
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

// ==========================================
// DEFAULT FUNCTION
// ==========================================
export default function StatusCalc({ 
    initialBaseStats
}: StatusCalcProps) {

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

    // 親から渡された種族値が変更されたら、ステートをリセットして再計算
    useEffect(() => {
        setStats(mapBaseStatsToRecord(initialBaseStats));
        setResults({ H: null, A: null, B: null, C: null, D: null, S: null });
    }, [initialBaseStats]);

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

            {/* 共通設定エリア*/}
            <div className="mb-8 p-4 bg-slate-800 rounded-xl border border-slate-700">
                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">性格 (Nature)</label>
                    <select
                        value={natureIndex}
                        onChange={(e) => setNatureIndex(Number(e.target.value))}
                        className="w-full border border-slate-700 rounded-lg p-2.5 bg-slate-900 text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
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
                                            disabled // 親から渡される想定のため読み取り専用に
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

            </div>
            

            {/* エラーメッセージ */}
            {globalError && (
                <div className="mb-6 p-4 bg-red-950/50 border-l-4 border-red-500 text-red-200 rounded-r">
                    <p className="font-bold">エラー</p>
                    <p>{globalError}</p>
                </div>
            )}

            <button
                onClick={handleCalculate}
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 active:transform active:scale-[0.99]"
            >
                {isLoading ? "バックエンドと通信して計算中..." : "計算する"}
            </button>
        </div>
    );
}