// src/features/pokedex/components/PokemonSearchForm.tsx
"use client";

import React from "react";
import { usePokemonSearchForm } from "../hooks/usePokemonSearchForm";
import type { PokemonInfo } from "@/features/pokedex/types";

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
    const { searchQuery, setSearchQuery, loading, handleSearch } = usePokemonSearchForm({
        onSearchStart,
        onSearchSuccess,
        onSearchError,
    });

    // Enterキーを押した時の処理
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // 親の BuildForm が submit されるのを防ぐ
            // @ts-ignore - handleSearchがFormEventを要求する場合の回避
            handleSearch(e);
        }
    };

    // 検索ボタンをクリックした時の処理
    const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault(); // 親の BuildForm が submit されるのを防ぐ
        // @ts-ignore
        handleSearch(e);
    };

    return (
        // <form> を <div> に変更
        <div className="flex gap-2">
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown} // Enterキーの検知を追加
                placeholder="ポケモン名 または 図鑑番号 (例: pikachu, 25)"
                className="flex-1 p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-100 placeholder-slate-500"
            />
            <button
                type="button" // "submit" から "button" に変更（超重要）
                onClick={handleButtonClick}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:bg-slate-700 disabled:text-slate-400"
            >
                {loading ? "検索中..." : "検索"}
            </button>
        </div>
    );
}