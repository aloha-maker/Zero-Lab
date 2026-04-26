"use client"; // 【必須】ファイルの先頭に記述します

import { useState, useEffect } from 'react';
// 変更点1: 共通の型とエラーレスポンス型をインポート
import type { StatusResponse, ApiErrorResponse } from "@/app/types/api";

export function PokemonForm() {
    const [selectedPokemon, setSelectedPokemon] = useState("charizard");
    const [selectedItem, setSelectedItem] = useState("");

    // 変更点2: 取得するデータの型を any から StatusResponse に変更
    const [stats, setStats] = useState<StatusResponse | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const updateStats = async () => {
            setErrorMsg(null);
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const res = await fetch(`${API_URL}/api/v1/status/?pokemon_name=${selectedPokemon}&item_name=${selectedItem}`);

                // 変更点3: エラーハンドリング
                if (!res.ok) {
                    const errorData = (await res.json()) as ApiErrorResponse;
                    throw new Error(typeof errorData.detail === 'string' ? errorData.detail : "ステータスの取得に失敗");
                }

                const data = (await res.json()) as StatusResponse;
                setStats(data);

            } catch (error: any) {
                console.error("ステータスの取得に失敗しました", error);
                setErrorMsg(error.message || "通信エラー");
                setStats(null);
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
            <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} className="border p-2 rounded">
                <option value="">なし</option>
                <option value="リザードナイトX">リザードナイトX</option>
                <option value="リザードナイトY">リザードナイトY</option>
            </select>

            {errorMsg && <p className="text-red-500 text-sm mt-2">{errorMsg}</p>}

            {/* ステータス表示エリア */}
            {stats && (
                <div className="mt-4 p-4 border rounded">
                    <h3 className="font-bold mb-2">
                        {/* StatusResponse側に is_mega が無い場合もありますが、既存踏襲 */}
                        {(stats as any).is_mega ? `メガシンカ後のステータス` : `通常ステータス`}
                    </h3>
                    <div className="grid grid-cols-6 gap-2">
                        {/* 変更点4: 型安全にするため stats から安全に取り出す */}
                        {Object.entries((stats as any).stats || {}).map(([key, value]) => (
                            <div key={key} className="text-center bg-gray-50 p-2 rounded">
                                <div className="text-xs uppercase text-gray-500">{key}</div>
                                <div className={`text-xl font-bold ${(stats as any).is_mega ? 'text-red-500' : ''}`}>
                                    {String(value)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}