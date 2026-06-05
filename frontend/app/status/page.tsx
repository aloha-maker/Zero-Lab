"use client";

import { useState } from "react";
import type { StatusRequest, StatusResponse, ApiErrorResponse } from "@/app/types/api";

type StatType = 'H' | 'A' | 'B' | 'C' | 'D' | 'S';

const statLabels: Record<StatType, string> = { H: "HP", A: "攻撃", B: "防御", C: "特攻", D: "特防", S: "素早さ" };

// 性格データの定義
const natures = [
    { name: "さみしがり (攻撃↑ 防御↓)", up: "A", down: "B" },
    { name: "いじっぱり (攻撃↑ 特攻↓)", up: "A", down: "C" },
    { name: "やんちゃ (攻撃↑ 特防↓)", up: "A", down: "D" },
    { name: "ゆうかん (攻撃↑ 素早↓)", up: "A", down: "S" },
    { name: "ずぶとい (防御↑ 攻撃↓)", up: "B", down: "A" },
    { name: "わんぱく (防御↑ 特攻↓)", up: "B", down: "C" },
    { name: "のうてんき (防御↑ 特防↓)", up: "B", down: "D" },
    { name: "のんき (防御↑ 素早↓)", up: "B", down: "S" },
    { name: "ひかえめ (特攻↑ 攻撃↓)", up: "C", down: "A" },
    { name: "おっとり (特攻↑ 防御↓)", up: "C", down: "B" },
    { name: "うっかりや (特攻↑ 特防↓)", up: "C", down: "D" },
    { name: "れいせい (特攻↑ 素早↓)", up: "C", down: "S" },
    { name: "おだやか (特防↑ 攻撃↓)", up: "D", down: "A" },
    { name: "おとなしい (特防↑ 防御↓)", up: "D", down: "B" },
    { name: "しんちょう (特防↑ 特攻↓)", up: "D", down: "C" },
    { name: "なまいき (特防↑ 素早↓)", up: "D", down: "S" },
    { name: "おくびょう (素早↑ 攻撃↓)", up: "S", down: "A" },
    { name: "せっかち (素早↑ 防御↓)", up: "S", down: "B" },
    { name: "ようき (素早↑ 特攻↓)", up: "S", down: "C" },
    { name: "むじゃき (素早↑ 特防↓)", up: "S", down: "D" },
    { name: "てれや (補正なし)", up: null, down: null },
    { name: "がんばりや (補正なし)", up: null, down: null },
    { name: "すなお (補正なし)", up: null, down: null },
    { name: "きまぐれ (補正なし)", up: null, down: null },
    { name: "まじめ (補正なし)", up: null, down: null },
];

export default function Home() {
    // 共通設定
    const [level, setLevel] = useState(50);
    const [natureIndex, setNatureIndex] = useState(18); // 初期値: ようき

    // 各ステータスの状態管理 (例: ガブリアス)
    const [stats, setStats] = useState<Record<StatType, { base: number, iv: number, ev: number }>>({
        H: { base: 108, iv: 31, ev: 0 },
        A: { base: 130, iv: 31, ev: 252 },
        B: { base: 95, iv: 31, ev: 0 },
        C: { base: 80, iv: 31, ev: 0 },
        D: { base: 85, iv: 31, ev: 0 },
        S: { base: 102, iv: 31, ev: 252 },
    });

    // 計算結果
    const [results, setResults] = useState<Record<StatType, number | null>>({
        H: null, A: null, B: null, C: null, D: null, S: null
    });
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);

    // 入力変更ハンドラ
    const handleStatChange = (stat: StatType, field: 'base' | 'iv' | 'ev', value: number) => {
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

        const selectedNature = natures[natureIndex];
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        try {
            // 6つのステータス計算APIを並列で呼び出す
            const promises = (Object.keys(stats) as StatType[]).map(async (key) => {
                let modifier = 1.0;
                if (key !== 'H') {
                    if (selectedNature.up === key) modifier = 1.1;
                    if (selectedNature.down === key) modifier = 0.9;
                }

                const requestData: StatusRequest = {
                    base_stat: stats[key].base,
                    iv: stats[key].iv,
                    ev: stats[key].ev,
                    level: level,
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

            // すべての計算が完了するのを待つ
            const resArray = await Promise.all(promises);

            // 結果をステートに反映
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

                    {/* 共通設定エリア */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">レベル (Level)</label>
                            <input
                                type="number"
                                value={level}
                                max={100}
                                min={1}
                                onChange={(e) => setLevel(Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">性格 (Nature)</label>
                            <select
                                value={natureIndex}
                                onChange={(e) => setNatureIndex(Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {natures.map((n, i) => (
                                    <option key={i} value={i}>{n.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ステータス入力テーブル */}
                    <div className="overflow-x-auto mb-8">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-gray-100 text-gray-700 text-sm">
                                    <th className="p-3 border-b font-bold w-1/6">ステータス</th>
                                    <th className="p-3 border-b font-bold text-center w-1/6">種族値</th>
                                    <th className="p-3 border-b font-bold text-center w-1/6">個体値</th>
                                    <th className="p-3 border-b font-bold text-center w-1/6">努力値</th>
                                    <th className="p-3 border-b font-bold text-center w-1/6">補正</th>
                                    <th className="p-3 border-b font-bold text-center w-1/6">実数値</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(Object.keys(stats) as StatType[]).map(key => {
                                    const selectedNature = natures[natureIndex];
                                    const isUp = key !== 'H' && selectedNature.up === key;
                                    const isDown = key !== 'H' && selectedNature.down === key;

                                    return (
                                        <tr key={key} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                            <td className="p-3 font-bold text-gray-800">{statLabels[key]}</td>
                                            <td className="p-2">
                                                <input type="number" value={stats[key].base} min={1} max={255} onChange={(e) => handleStatChange(key, 'base', Number(e.target.value))} className="w-full border border-gray-300 rounded p-1.5 text-center focus:border-blue-500 outline-none" />
                                            </td>
                                            <td className="p-2">
                                                <input type="number" value={stats[key].iv} min={0} max={31} onChange={(e) => handleStatChange(key, 'iv', Number(e.target.value))} className="w-full border border-gray-300 rounded p-1.5 text-center focus:border-blue-500 outline-none" />
                                            </td>
                                            <td className="p-2">
                                                <input type="number" value={stats[key].ev} min={0} max={252} step={4} onChange={(e) => handleStatChange(key, 'ev', Number(e.target.value))} className="w-full border border-gray-300 rounded p-1.5 text-center focus:border-blue-500 outline-none" />
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