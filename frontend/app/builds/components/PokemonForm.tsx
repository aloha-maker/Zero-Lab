"use client"; // 【必須】ファイルの先頭に記述します

import { useState, useEffect } from 'react';

export function PokemonForm() {
    const [selectedPokemon, setSelectedPokemon] = useState("charizard");
    const [selectedItem, setSelectedItem] = useState("");
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const updateStats = async () => {
            // 実際のバックエンドのURLに合わせる（例: http://localhost:8000）
            try {
                const res = await fetch(`http://localhost:8000/api/v1/status/?pokemon_name=${selectedPokemon}&item_name=${selectedItem}`);
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("ステータスの取得に失敗しました", error);
            }
        };

        // 選択されている場合のみ実行
        if (selectedPokemon) {
            updateStats();
        }
    }, [selectedPokemon, selectedItem]);

    return (
        <div>
            {/* 持ち物選択セレクトボックス */}
            <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="border p-2 rounded"
            >
                <option value="">なし</option>
                <option value="リザードナイトX">リザードナイトX</option>
                <option value="リザードナイトY">リザードナイトY</option>
            </select>

            {/* ステータス表示エリア */}
            <div className="mt-4 p-4 border rounded">
                <h3 className="font-bold mb-2">
                    {stats?.is_mega ? `メガシンカ後のステータス` : `通常ステータス`}
                </h3>

                <div className="grid grid-cols-6 gap-2">
                    {/* TypeScriptエラー回避のため、型を明示的に変換するか、String()で囲みます */}
                    {Object.entries(stats?.stats || {}).map(([key, value]) => (
                        <div key={key} className="text-center bg-gray-50 p-2 rounded">
                            <div className="text-xs uppercase text-gray-500">{key}</div>
                            <div className={`text-xl font-bold ${stats?.is_mega ? 'text-red-500' : ''}`}>
                                {String(value)} {/* 【修正】明示的に文字列化して描画エラーを防ぐ */}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}