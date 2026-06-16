"use client";

import { useState } from "react";
import type { StatusRequest, StatusResponse, ApiErrorResponse } from "@/app/types/api";
import { NATURES } from "@/app/types/constants";

type StatType = 'H' | 'A' | 'B' | 'C' | 'D' | 'S';

const statLabels: Record<StatType, string> = { H: "HP", A: "攻撃", B: "防御", C: "特攻", D: "特防", S: "素早さ" };

export default function Home() {
    // 共通設定
    const FIXED_LEVEL = 50;
    const [natureIndex, setNatureIndex] = useState(18); // 初期値: ようき

    // 各ステータスの状態管理
    const [stats, setStats] = useState<Record<StatType, { base: number, iv: number, ev: number }>>({
        H: { base: 108, iv: 31, ev: 0 },
        A: { base: 130, iv: 31, ev: 32 },
        B: { base: 95, iv: 31, ev: 0 },
        C: { base: 80, iv: 31, ev: 0 },
        D: { base: 85, iv: 31, ev: 0 },
        S: { base: 102, iv: 31, ev: 32 },
    });

    // 計算結果
    const [results, setResults] = useState<Record<StatType, number | null>>({
        H: null, A: null, B: null, C: null, D: null, S: null
    });
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);

    // 入力変更ハンドラ
    const handleStatChange = (stat: StatType, field: 'base' | 'ev', value: number) => {
        setStats(prev => ({
            ...prev,
            [stat]: { ...prev[stat], [field]: value }
        }));
    };

    // 一括計算処理
    const handleCalculate = async () => {
        setIsLoading(true);
        setGlobalError(null);
        setResults({ H: null, A: null, B: null, C: null, D: null, S: null });

        const selectedNature = NATURES[natureIndex];
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        try {
            const promises = (Object.keys(stats) as StatType[]).map(async (key) => {
                let modifier = 1.0;
                if (key !== 'H') {
                    if (selectedNature.up === key) modifier = 1.1;
                    if (selectedNature.down === key) modifier = 0.9;
                }

                const requestData: StatusRequest = {
                    base_stat: stats[key].base,
                    iv: 31, 
                    ev: stats[key].ev,
                    level: FIXED_LEVEL,
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
            setGlobalError(error.message || "サーバーとの通信に失敗しました。Dockerコンテナは起動していますか？");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Zero-Lab (Status Calc)</h1>
                </header>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">

                    {/* 共通設定エリア*/}
                    <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">性格 (Nature)</label>
                            <select
                                value={natureIndex}
                                onChange={(e) => setNatureIndex(Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-gray-500"
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
                                <tr className="bg-gray-100 text-gray-700 text-sm">
                                    <th className="p-3 border-b font-bold w-1/5">ステータス</th>
                                    <th className="p-3 border-b font-bold text-center w-1/5">種族値</th>
                                    <th className="p-3 border-b font-bold text-center w-1/5">努力値 (0~32)</th>
                                    <th className="p-3 border-b font-bold text-center w-1/5">性格補正</th>
                                    <th className="p-3 border-b font-bold text-center w-1/5">実数値 (Lv.50)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(Object.keys(stats) as StatType[]).map(key => {
                                    const selectedNature = NATURES[natureIndex];
                                    const isUp = key !== 'H' && selectedNature.up === key;
                                    const isDown = key !== 'H' && selectedNature.down === key;

                                    return (
                                        <tr key={key} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                            <td className="p-3 font-bold text-gray-800">{statLabels[key]}</td>
                                            <td className="p-2">
                                                <input type="number" value={stats[key].base} min={1} max={255} onChange={(e) => handleStatChange(key, 'base', Number(e.target.value))} className="w-full border border-gray-300 rounded p-1.5 text-center focus:border-blue-500 outline-none text-gray-500" />
                                            </td>
                                            <td className="p-2">
                                                <input 
                                                    type="number" 
                                                    value={stats[key].ev} 
                                                    min={0} 
                                                    max={32} 
                                                    step={1} 
                                                    onChange={(e) => handleStatChange(key, 'ev', Number(e.target.value))} 
                                                    className="w-full border border-gray-300 rounded p-1.5 text-center focus:border-blue-500 outline-none text-gray-500" 
                                                />
                                            </td>
                                            <td className="p-3 text-center font-bold">
                                                {key === 'H' ? <span className="text-gray-300">-</span> :
                                                    isUp ? <span className="text-red-500 bg-red-50 px-2 py-1 rounded">1.1</span> :
                                                        isDown ? <span className="text-blue-500 bg-blue-50 px-2 py-1 rounded">0.9</span> :
                                                            <span className="text-gray-500">1.0</span>}
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="bg-blue-50 text-blue-700 font-extrabold text-xl py-1 rounded-lg min-h-[36px] flex items-center justify-center">
                                                    {results[key] !== null ? results[key] : <span className="text-blue-200">-</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* エラーメッセージ */}
                    {globalError && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r">
                            <p className="font-bold">エラー</p>
                            <p>{globalError}</p>
                        </div>
                    )}

                    <button
                        onClick={handleCalculate}
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 active:transform active:scale-[0.99]"
                    >
                        {isLoading ? "バックエンドと通信して計算中..." : "計算する"}
                    </button>
                </div>
            </div>
        </main>
    );
}