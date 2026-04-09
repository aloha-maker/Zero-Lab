"use client";

import { useState, useMemo } from "react";

// --- 型定義 ---
type PokemonSpeedInfo = {
    id: string;
    name: string;
    baseStats: number;     // 種族値
    ev: number;            // 努力値 (0~252)
    iv: number;            // 個体値 (基本31)
    nature: number;        // 性格補正 (0.9, 1.0, 1.1)
    rank: number;          // ランク補正 (-6 〜 +6)
    itemMultiplier: number;// アイテム・特性補正 (スカーフ1.5など)
    tailwind: boolean;     // おいかぜ (2倍)
    paralysis: boolean;    // まひ (0.5倍)
};

// --- 素早さ計算ロジック ---
const calculateSpeed = (p: PokemonSpeedInfo): number => {
    // 1. 実数値の計算 (レベル50想定)
    const statVal = Math.floor(
        (Math.floor((p.baseStats * 2 + p.iv + Math.floor(p.ev / 4)) * 50) / 100) + 5
    );
    let realStat = Math.floor(statVal * p.nature);

    // 2. ランク補正
    const rankMultiplier = p.rank >= 0 ? (2 + p.rank) / 2 : 2 / (2 - p.rank);
    let finalSpeed = Math.floor(realStat * rankMultiplier);

    // 3. その他補正
    finalSpeed = Math.floor(finalSpeed * p.itemMultiplier);
    if (p.tailwind) finalSpeed = Math.floor(finalSpeed * 2);
    if (p.paralysis) finalSpeed = Math.floor(finalSpeed * 0.5);

    return finalSpeed;
};

export default function SpeedComparePage() {
    const [pokemons, setPokemons] = useState<PokemonSpeedInfo[]>([
        {
            id: "1",
            name: "ポケモンA (例: ガブリアス)",
            baseStats: 102,
            ev: 252,
            iv: 31,
            nature: 1.1,
            rank: 0,
            itemMultiplier: 1.0,
            tailwind: false,
            paralysis: false,
        },
        {
            id: "2",
            name: "ポケモンB (例: サザンドラ)",
            baseStats: 98,
            ev: 252,
            iv: 31,
            nature: 1.1,
            rank: 0,
            itemMultiplier: 1.5, // スカーフ想定
            tailwind: false,
            paralysis: false,
        },
    ]);

    // 更新ハンドラー
    const updatePokemon = (id: string, field: keyof PokemonSpeedInfo, value: any) => {
        setPokemons((prev) =>
            prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
        );
    };

    // ポケモン追加
    const addPokemon = () => {
        const newId = Math.random().toString(36).substring(2, 9);
        setPokemons((prev) => [
            ...prev,
            {
                id: newId,
                name: `ポケモン ${prev.length + 1}`,
                baseStats: 100,
                ev: 252,
                iv: 31,
                nature: 1.1,
                rank: 0,
                itemMultiplier: 1.0,
                tailwind: false,
                paralysis: false,
            },
        ]);
    };

    // ポケモン削除
    const removePokemon = (id: string) => {
        setPokemons((prev) => prev.filter((p) => p.id !== id));
    };

    // 素早さ順にソートした配列を生成
    const sortedPokemons = useMemo(() => {
        return [...pokemons].sort((a, b) => calculateSpeed(b) - calculateSpeed(a));
    }, [pokemons]);

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">すばやさ比較ツール</h1>
            <p className="text-gray-600">入力するとリアルタイムで計算・並び替えされます。(Lv.50想定)</p>

            {/* 比較結果（ランキング表示） */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                <h2 className="text-lg font-bold text-blue-800 mb-3">▶ 最終すばやさランキング</h2>
                <ul className="space-y-2">
                    {sortedPokemons.map((p, index) => (
                        <li key={p.id} className="flex items-center justify-between bg-white p-3 rounded shadow-sm">
                            <span className="font-bold text-gray-700">
                                {index + 1}位：{p.name}
                            </span>
                            <span className="text-xl font-bold text-blue-600">
                                {calculateSpeed(p)}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 入力フォーム */}
            <div className="space-y-4">
                {pokemons.map((p) => (
                    <div key={p.id} className="bg-white border rounded-lg p-4 shadow-sm flex flex-col md:flex-row gap-4 relative">
                        <button
                            onClick={() => removePokemon(p.id)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold"
                        >
                            ✕
                        </button>

                        <div className="flex-1 space-y-3">
                            <div>
                                <label className="block text-sm text-gray-600">名前</label>
                                <input
                                    type="text"
                                    value={p.name}
                                    onChange={(e) => updatePokemon(p.id, "name", e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="w-1/2">
                                    <label className="block text-sm text-gray-600">種族値</label>
                                    <input
                                        type="number"
                                        value={p.baseStats}
                                        onChange={(e) => updatePokemon(p.id, "baseStats", Number(e.target.value))}
                                        className="w-full border rounded px-2 py-1"
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm text-gray-600">努力値</label>
                                    <input
                                        type="number"
                                        value={p.ev}
                                        step={4}
                                        max={252}
                                        min={0}
                                        onChange={(e) => updatePokemon(p.id, "ev", Number(e.target.value))}
                                        className="w-full border rounded px-2 py-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-3">
                            <div className="flex gap-2">
                                <div className="w-1/2">
                                    <label className="block text-sm text-gray-600">性格補正</label>
                                    <select
                                        value={p.nature}
                                        onChange={(e) => updatePokemon(p.id, "nature", Number(e.target.value))}
                                        className="w-full border rounded px-2 py-1"
                                    >
                                        <option value={1.1}>上昇 (1.1倍)</option>
                                        <option value={1.0}>無補正 (1.0倍)</option>
                                        <option value={0.9}>下降 (0.9倍)</option>
                                    </select>
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm text-gray-600">ランク</label>
                                    <input
                                        type="number"
                                        value={p.rank}
                                        max={6}
                                        min={-6}
                                        onChange={(e) => updatePokemon(p.id, "rank", Number(e.target.value))}
                                        className="w-full border rounded px-2 py-1"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 items-center flex-wrap">
                                <label className="flex items-center text-sm">
                                    <input
                                        type="checkbox"
                                        checked={p.itemMultiplier === 1.5}
                                        onChange={(e) => updatePokemon(p.id, "itemMultiplier", e.target.checked ? 1.5 : 1.0)}
                                        className="mr-1"
                                    />
                                    スカーフ等(1.5倍)
                                </label>
                                <label className="flex items-center text-sm">
                                    <input
                                        type="checkbox"
                                        checked={p.tailwind}
                                        onChange={(e) => updatePokemon(p.id, "tailwind", e.target.checked)}
                                        className="mr-1"
                                    />
                                    おいかぜ
                                </label>
                                <label className="flex items-center text-sm">
                                    <input
                                        type="checkbox"
                                        checked={p.paralysis}
                                        onChange={(e) => updatePokemon(p.id, "paralysis", e.target.checked)}
                                        className="mr-1"
                                    />
                                    まひ
                                </label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={addPokemon}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                ＋ ポケモンを追加して比較する
            </button>
        </div>
    );
}