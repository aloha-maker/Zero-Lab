"use client";

import React, { useState } from "react";
import type { PokemonInfo, ApiErrorResponse } from "@/app/types/api";
import { API_URL } from "@/app/types/constants";

// ==========================================
// 親コンポーネントから受け取る Props の定義
// ==========================================
interface SearchFormProps {
    onSearchStart: () => void;
    onSearchSuccess: (data: PokemonInfo) => void;
    onSearchError: (message: string) => void;
}

export default function PokemonSearchForm({
    onSearchStart,
    onSearchSuccess,
    onSearchError,
}: SearchFormProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        // 検索開始を親に通知（古いデータやエラーの表示を消すため）
        onSearchStart();
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/v1/pokemon/${searchQuery.toLowerCase()}`);

            if (!response.ok) {
                const errorData = (await response.json()) as ApiErrorResponse;
                let errorMessage = "ポケモンの情報の取得に失敗しました";

                if (response.status === 404) {
                    errorMessage = "指定されたポケモンが見つかりませんでした";
                } else if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else if (Array.isArray(errorData.detail)) {
                    errorMessage = "入力内容に誤りがあります（" + errorData.detail.map(err => err.msg).join(", ") + "）";
                }
                throw new Error(errorMessage);
            }

            const data = (await response.json()) as PokemonInfo;
            // 成功したら親にデータを渡す
            onSearchSuccess(data);

        } catch (err: any) {
            console.error("Error:", err);
            // 失敗したら親にエラーメッセージを渡す
            onSearchError(err.message || "通信エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSearch} className="mb-8 flex gap-2">
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ポケモン名 または 図鑑番号 (例: pikachu, 25)"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-500 placeholder-gray-500"
            />
            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
            >
                {loading ? "検索中..." : "検索"}
            </button>
        </form>
    );
}