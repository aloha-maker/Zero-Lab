// frontend/features/pokedex/components/PokemonDetailCard.tsx
"use client";

import React, { useState } from "react";
import type { PokemonInfo } from "../types";

interface PokemonDetailCardProps {
    pokemon: PokemonInfo;
}

export default function PokemonDetailCard({ pokemon }: PokemonDetailCardProps) {
    const [isMovesOpen, setIsMovesOpen] = useState(false);

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            {/* ヘッダー部分 */}
            <div className="bg-blue-600 p-6 text-white flex flex-col md:flex-row items-center gap-6">
                {pokemon.image_url && (
                    <div className="bg-white p-2 rounded-full shadow-inner">
                        <img src={pokemon.image_url} alt={pokemon.name} className="w-32 h-32 object-contain" />
                    </div>
                )}
                <div className="text-center md:text-left">
                    <span className="text-blue-200 font-mono text-xl">No.{String(pokemon.id).padStart(3, '0')}</span>
                    <h2 className="text-4xl font-black capitalize">{pokemon.name}</h2>
                    <p className="text-blue-100 opacity-80 uppercase tracking-widest">{pokemon.english_name}</p>
                </div>
            </div>

            {/* 詳細スペック */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 基本データ */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">タイプ</h3>
                        <div className="flex gap-2">
                            {pokemon.types.map(type => (
                                <span key={type} className="px-4 py-1 rounded-full bg-gray-100 text-gray-700 font-bold capitalize border border-gray-200">
                                    {type}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">特性</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                            {pokemon.abilities.map(ability => (
                                <li key={ability} className="capitalize">{ability}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex gap-8">
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-1">高さ</h3>
                            <p className="text-lg font-bold text-gray-700">{pokemon.height_m} m</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-1">重さ</h3>
                            <p className="text-lg font-bold text-gray-700">{pokemon.weight_kg} kg</p>
                        </div>
                    </div>
                </div>

                {/* 種族値グラフ表示 */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">種族値 (Base Stats)</h3>
                    <div className="space-y-3">
                        {Object.entries(pokemon.base_stats).map(([stat, value]) => (
                            <div key={stat}>
                                <div className="flex justify-between text-xs font-bold mb-1 uppercase text-gray-600">
                                    <span>{stat}</span>
                                    <span>{value}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, (value / 255) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 覚える技（折りたたみ表形式） */}
            <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-200">
                <button
                    onClick={() => setIsMovesOpen(!isMovesOpen)}
                    className="w-full flex justify-between items-center bg-white hover:bg-gray-100 px-4 py-3 rounded-lg border border-gray-200 font-medium text-sm text-gray-700 transition shadow-sm"
                >
                    <span>覚える技一覧 ({pokemon.moves.length}件)</span>
                    <span className={`transform transition-transform duration-200 text-gray-400 ${isMovesOpen ? "rotate-180" : ""}`}>
                        ▼
                    </span>
                </button>

                {isMovesOpen && (
                    <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3">技名</th>
                                        <th className="px-4 py-3">タイプ</th>
                                        <th className="px-4 py-3 text-center">カテゴリ</th>
                                        <th className="px-4 py-3 text-right">威力</th>
                                        <th className="px-4 py-3 text-right">命中</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pokemon.moves.map((move, index) => {
                                        const damageClassColors = {
                                            "ぶつり": "bg-orange-50 text-orange-700 border-orange-200",
                                            "とくしゅ": "bg-blue-50 text-blue-700 border-blue-200",
                                            "へんか": "bg-gray-100 text-gray-600 border-gray-300",
                                        }[move.damage_class] || "bg-gray-50 text-gray-500 border-gray-200";

                                        return (
                                            <tr key={index} className="hover:bg-gray-50/70 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-800">{move.name}</td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                                                        {move.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${damageClassColors}`}>
                                                        {move.damage_class}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-gray-600 font-medium">
                                                    {move.power !== null && move.power !== undefined ? move.power : "—"}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-gray-500">
                                                    {move.accuracy !== null && move.accuracy !== undefined ? `${move.accuracy}%` : "—"}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}