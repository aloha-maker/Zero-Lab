"use client";

import { useState } from "react";

export default function DamageCalculator() {
    const [level, setLevel] = useState(50);
    const [power, setPower] = useState(90); // 技の威力
    const [attack, setAttack] = useState(150); // 攻撃側ステータス
    const [defense, setDefense] = useState(100); // 防御側ステータス
    const [isStab, setIsStab] = useState(true); // タイプ一致 (Same Type Attack Bonus)
    const [effectiveness, setEffectiveness] = useState(1); // タイプ相性 (0.25, 0.5, 1, 2, 4)

    const [result, setResult] = useState<{ min: number; max: number } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${API_URL}/api/v1/damage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    level,
                    power,
                    attack,
                    defense,
                    is_stab: isStab,
                    effectiveness,
                }),
            });

            if (!response.ok) throw new Error("計算に失敗しました");

            const data = await response.json();
            setResult({ min: data.min_damage, max: data.max_damage });
        } catch (error) {
            console.error(error);
            alert("通信エラーが発生しました。バックエンドが起動しているか確認してください。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">⚔️ ダメージ計算</h2>

            <form onSubmit={handleCalculate} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">レベル</label>
                        <input type="number" value={level} onChange={(e) => setLevel(Number(e.target.value))} className="w-full border rounded-lg p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">技の威力</label>
                        <input type="number" value={power} onChange={(e) => setPower(Number(e.target.value))} className="w-full border rounded-lg p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">攻撃側 実数値</label>
                        <input type="number" value={attack} onChange={(e) => setAttack(Number(e.target.value))} className="w-full border rounded-lg p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">防御側 実数値</label>
                        <input type="number" value={defense} onChange={(e) => setDefense(Number(e.target.value))} className="w-full border rounded-lg p-2" required />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">タイプ一致 (1.5倍)</label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={isStab} onChange={(e) => setIsStab(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                            <span className="text-sm">一致する</span>
                        </label>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">タイプ相性</label>
                        <select value={effectiveness} onChange={(e) => setEffectiveness(Number(e.target.value))} className="w-full border rounded-lg p-2 bg-white">
                            <option value={4}>ばつぐん (4倍)</option>
                            <option value={2}>ばつぐん (2倍)</option>
                            <option value={1}>等倍 (1倍)</option>
                            <option value={0.5}>いまひとつ (0.5倍)</option>
                            <option value={0.25}>いまひとつ (0.25倍)</option>
                        </select>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition disabled:bg-gray-400">
                    {loading ? "計算中..." : "ダメージを計算する"}
                </button>
            </form>

            {result && (
                <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
                    <h3 className="text-lg font-bold text-red-800 mb-2">計算結果（乱数85%〜100%）</h3>
                    <p className="text-3xl font-extrabold text-red-600">
                        {result.min} <span className="text-xl text-gray-500 font-medium mx-2">〜</span> {result.max} <span className="text-lg text-gray-600">ダメージ</span>
                    </p>
                </div>
            )}
        </div>
    );
}