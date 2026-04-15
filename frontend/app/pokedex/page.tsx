"use client";

import { useState } from "react";

// --- 型定義 (FastAPIのレスポンスに合わせる) ---
type PokemonData = {
    uniqueId: string; // 表示用のユニークID（同じポケモンを複数並べるため）
    id: number;
    name: string;
    english_name: string;
    types: string[];
    abilities: string[];
    base_stats: { [key: string]: number };
    weight_kg: number;
    height_m: number;
    image_url: string | undefined;
};

// 種族値の表示用マッピング
const statLabels: { [key: string]: string } = {
    "hp": "HP",
    "attack": "こうげき",
    "defense": "ぼうぎょ",
    "special-attack": "とくこう",
    "special-defense": "とくぼう",
    "speed": "すばやさ"
};

export default function PokedexPage() {
    const [pokemons, setPokemons] = useState<PokemonData[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // FastAPIサーバーのURL（環境に合わせて変更してください）
    const API_BASE_URL = "http://localhost:8000/api/pokemon";

    // --- APIからポケモンを検索して追加 ---
    const searchAndAddPokemon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setErrorMsg("");

        try {
            const res = await fetch(`${API_BASE_URL}/${searchQuery.trim().toLowerCase()}`);
            if (!res.ok) {
                if (res.status === 404) throw new Error("ポケモンが見つかりませんでした。");
                throw new Error("データの取得に失敗しました。");
            }

            const data = await res.json();

            // Reactでのリスト表示用に一意のIDを付与して追加
            const newPokemon: PokemonData = {
                ...data,
                uniqueId: Math.random().toString(36).substring(2, 9)
            };

            setPokemons((prev) => [newPokemon, ...prev]); // 新しいものを一番上に追加
            setSearchQuery("");
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ポケモンをリストから削除
    const removePokemon = (uniqueId: string) => {
        setPokemons((prev) => prev.filter((p) => p.uniqueId !== uniqueId));
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">ポケモンデータ検索ツール</h1>

            {/* 検索フォーム */}
            <form onSubmit={searchAndAddPokemon} className="bg-white border rounded-lg p-4 shadow-sm space-y-2">
                <label className="block text-sm font-bold text-gray-700">ポケモンを検索 (英語名 or 図鑑番号)</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="例: pikachu, 25, garchomp"
                        className="flex-1 border rounded px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? "検索中..." : "検索"}
                    </button>
                </div>
                {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
            </form>

            {/* 検索結果（カード表示） */}
            <div className="space-y-4">
                {pokemons.map((p) => (
                    <div key={p.uniqueId} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
                        <button
                            onClick={() => removePokemon(p.uniqueId)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 font-bold p-2 transition-colors"
                        >
                            ✕
                        </button>

                        <div className="flex flex-col md:flex-row gap-6">
                            {/* 左側: 画像と基本情報 */}
                            <div className="flex flex-col items-center justify-center w-full md:w-1/3 bg-gray-50 rounded-lg p-4">
                                <span className="text-sm font-bold text-gray-400">No.{p.id}</span>
                                {p.image_url ? (
                                    <img src={p.image_url} alt={p.name} className="w-32 h-32 object-contain" />
                                ) : (
                                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mb-2">No Image</div>
                                )}
                                <h2 className="text-xl font-bold text-gray-800 text-center">{p.name}</h2>
                                <p className="text-xs text-gray-500 text-center mb-3">{p.english_name}</p>

                                <div className="flex gap-1 flex-wrap justify-center">
                                    {p.types.map((type, idx) => (
                                        <span key={idx} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full font-semibold">
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* 右側: 詳細データ（特性・サイズ・種族値） */}
                            <div className="w-full md:w-2/3 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 rounded p-3">
                                        <p className="text-xs text-blue-800 font-bold mb-1">特性</p>
                                        <ul className="text-sm text-gray-700 space-y-1">
                                            {p.abilities.map((ability, idx) => (
                                                <li key={idx}>・{ability}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-green-50 rounded p-3 flex flex-col justify-center">
                                        <p className="text-xs text-green-800 font-bold mb-1">サイズ</p>
                                        <p className="text-sm text-gray-700">高さ: <span className="font-bold">{p.height_m}</span> m</p>
                                        <p className="text-sm text-gray-700">重さ: <span className="font-bold">{p.weight_kg}</span> kg</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-gray-700 mb-2 border-b pb-1">種族値</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.entries(p.base_stats).map(([statName, statValue]) => (
                                            <div key={statName} className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded px-2 py-1">
                                                <span className="text-xs text-gray-600">{statLabels[statName] || statName}</span>
                                                <span className="text-sm font-bold text-gray-800">{statValue}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {pokemons.length === 0 && (
                    <div className="text-center text-gray-400 py-16 bg-white border border-dashed border-gray-300 rounded-lg">
                        上の検索バーからポケモンのデータを取得してください。<br />
                        (英語名、または図鑑番号で検索できます)
                    </div>
                )}
            </div>
        </div>
    );
}