"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// 変更点1: 共通の型とエラーレスポンス型をインポート
import type { PokemonBuildResponse, ApiErrorResponse } from "@/app/types/api";

export default function BuildsPage() {
    // 変更点2: インポートした型を適用
    const [builds, setBuilds] = useState<PokemonBuildResponse[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fetchBuilds = async () => {
        setErrorMsg(null);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${API_URL}/api/v1/builds`);

            if (!res.ok) {
                throw new Error("データの取得に失敗しました");
            }

            const json = await res.json();
            // バックエンドが {"status": "success", "data": [...]} を返す想定
            if (json.status === "success") {
                setBuilds(json.data);
            } else {
                setBuilds([]);
            }
        } catch (error: any) {
            console.error("データの取得に失敗しました", error);
            setErrorMsg(error.message || "通信エラーが発生しました");
            setBuilds([]);
        }
    };

    useEffect(() => {
        fetchBuilds();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("削除しますか？")) return;

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${API_URL}/api/v1/builds/${id}`, { method: "DELETE" });

            // 変更点3: 削除失敗時の詳細なエラーハンドリング
            if (!res.ok) {
                const errorData = (await res.json()) as ApiErrorResponse;
                let errorMessage = "削除に失敗しました";
                if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                }
                throw new Error(errorMessage);
            }

            fetchBuilds(); // 成功したら再取得
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6 border-b-2 border-blue-500 pb-2">
                <h1 className="text-3xl font-bold text-gray-800">育成論一覧</h1>
                <Link href="/builds/new" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition shadow">
                    ＋ 新規登録
                </Link>
            </div>

            {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                    <p className="font-medium">{errorMsg}</p>
                </div>
            )}

            {builds.length === 0 && !errorMsg ? (
                <p className="text-gray-500 text-center py-10 bg-white rounded shadow-sm">まだ育成論が登録されていません</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {builds.map(b => (
                        <div key={b.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{b.pokemon_name} {b.nickname ? `(${b.nickname})` : ""}</h2>
                                <p className="text-sm text-gray-600 mt-1">性格: {b.nature} / 持ち物: {b.item} / テラス: {b.tera_type}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Link href={`/builds/edit/${b.id}`} className="text-center bg-green-100 hover:bg-green-200 text-green-700 py-1 px-3 rounded text-sm font-bold transition">
                                    編集
                                </Link>
                                <button onClick={() => handleDelete(b.id)} className="bg-red-100 hover:bg-red-200 text-red-700 py-1 px-3 rounded text-sm font-bold transition">
                                    削除
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}