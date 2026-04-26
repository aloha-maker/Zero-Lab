"use client";

import { useState } from "react";
import type { TypeMatchupRequest, TypeMatchupResponse, ApiErrorResponse } from "@/app/types/api";

// PokeAPIに送信するための英語名と、表示用の日本語名のマッピング
const POKEMON_TYPES = [
    { en: "normal", ja: "ノーマル" },
    { en: "fire", ja: "ほのお" },
    { en: "water", ja: "みず" },
    { en: "electric", ja: "でんき" },
    { en: "grass", ja: "くさ" },
    { en: "ice", ja: "こおり" },
    { en: "fighting", ja: "かくとう" },
    { en: "poison", ja: "どく" },
    { en: "ground", ja: "じめん" },
    { en: "flying", ja: "ひこう" },
    { en: "psychic", ja: "エスパー" },
    { en: "bug", ja: "むし" },
    { en: "rock", ja: "いわ" },
    { en: "ghost", ja: "ゴースト" },
    { en: "dragon", ja: "ドラゴン" },
    { en: "dark", ja: "あく" },
    { en: "steel", ja: "はがね" },
    { en: "fairy", ja: "フェアリー" },
];

export default function TypeMatchupPage() {
    const [attackerType, setAttackerType] = useState("normal");
    const [defenderType1, setDefenderType1] = useState("normal");
    const [defenderType2, setDefenderType2] = useState("");

    const [result, setResult] = useState<TypeMatchupResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCalculate = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        const requestData: TypeMatchupRequest = {
            attacker_type: attackerType,
            defender_types: [defenderType1, defenderType2].filter(Boolean),
        };

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

            const response = await fetch(`${API_URL}/api/v1/type_matchup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorData = (await response.json()) as ApiErrorResponse;
                let errorMessage = "相性の計算に失敗しました";

                if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else if (Array.isArray(errorData.detail)) {
                    errorMessage = "入力内容に誤りがあります（" + errorData.detail.map(err => err.msg).join(", ") + "）";
                }
                throw new Error(errorMessage);
            }

            const data = (await response.json()) as TypeMatchupResponse;
            setResult(data);

        } catch (err: any) {
            console.error("Error:", err);
            setError(err.message || "通信エラーが発生しました。バックエンドが起動しているか確認してください。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">タイプ相性チェッカー</h1>

            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                {/* 攻撃側の設定 */}
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        攻撃側のわざタイプ
                    </label>
                    <select
                        value={attackerType}
                        onChange={(e) => setAttackerType(e.target.value)}
                        className="block w-full border border-gray-300 rounded py-2 px-3 focus:outline-none focus:border-blue-500"
                    >
                        {POKEMON_TYPES.map((type) => (
                            <option key={type.en} value={type.en}>
                                {type.ja}
                            </option>
                        ))}
                    </select>
                </div>

                <hr className="my-6" />

                {/* 防御側の設定 */}
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        防御側のタイプ 1
                    </label>
                    <select
                        value={defenderType1}
                        onChange={(e) => setDefenderType1(e.target.value)}
                        className="block w-full border border-gray-300 rounded py-2 px-3 focus:outline-none focus:border-blue-500 mb-4"
                    >
                        {POKEMON_TYPES.map((type) => (
                            <option key={type.en} value={type.en}>
                                {type.ja}
                            </option>
                        ))}
                    </select>

                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        防御側のタイプ 2 (任意)
                    </label>
                    <select
                        value={defenderType2}
                        onChange={(e) => setDefenderType2(e.target.value)}
                        className="block w-full border border-gray-300 rounded py-2 px-3 focus:outline-none focus:border-blue-500"
                    >
                        <option value="">(なし)</option>
                        {POKEMON_TYPES.map((type) => (
                            <option key={type.en} value={type.en}>
                                {type.ja}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleCalculate}
                    disabled={loading}
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none disabled:bg-gray-400"
                >
                    {loading ? "計算中..." : "相性を判定する"}
                </button>

                {error && (
                    <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                        <p className="font-bold">{error}</p>
                    </div>
                )}

                {result && (
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center border border-blue-200">
                        <h2 className="text-xl font-bold text-blue-800 mb-2">判定結果</h2>
                        <p className="text-4xl font-extrabold text-blue-600 mb-2">
                            x {result.multiplier.toFixed(2)}
                        </p>
                        <p className="text-lg font-bold text-gray-700">{result.message}</p>
                    </div>
                )}
            </div>
        </main>
    );
}