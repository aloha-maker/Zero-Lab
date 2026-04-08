"use client";

import { useState } from "react";

export default function Home() {
    // 入力フォームの状態管理
    const [base, setBase] = useState(108); // 種族値 (例: ガブリアス)
    const [iv, setIv] = useState(31);      // 個体値
    const [ev, setEv] = useState(252);     // 努力値
    const [level, setLevel] = useState(50); // レベル

    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // 「計算する」ボタンが押されたときの処理
    const handleCalculate = async () => {
        setIsLoading(true);
        setResult("バックエンドと通信中...");

        try {
            // 環境変数があればそれを使い、なければローカル環境を使う
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

            // 魔法の電話線：PythonのバックエンドへJSONデータを送信！
            const response = await fetch(`${API_URL}/api/calculate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    base_stat: base,
                    iv: iv,
                    ev: ev,
                    level: level,
                    is_hp: true
                }),
            });

            const data = await response.json();
            if (response.ok && data.real_stat !== undefined) {
                setResult(`実数値: ${data.real_stat}`);
            } else {
                setResult("エラーが発生しました: " + (data.detail ? JSON.stringify(data.detail) : "不明なエラー"));
            }
        } catch (error) {
            console.error("Error:", error);
            setResult("サーバーとの通信に失敗しました。Dockerコンテナは起動していますか？");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Zero-Lab</h1>
                    <p className="text-gray-500 mt-2 font-medium">API通信テスト：HP実数値計算</p>
                </header>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">種族値 (Base)</label>
                            <input type="number" value={base} onChange={(e) => setBase(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">個体値 (IV)</label>
                            <input type="number" value={iv} max={31} onChange={(e) => setIv(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">努力値 (EV)</label>
                            <input type="number" value={ev} max={252} step={4} onChange={(e) => setEv(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">レベル (Level)</label>
                            <input type="number" value={level} max={100} onChange={(e) => setLevel(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2" />
                        </div>
                    </div>

                    <button
                        onClick={handleCalculate}
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md disabled:opacity-50"
                    >
                        {isLoading ? "通信中..." : "バックエンドで計算する"}
                    </button>

                    {/* 結果表示エリア */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                        <p className="text-lg font-bold text-gray-800">
                            {result || "数値を入力してボタンを押してください"}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}