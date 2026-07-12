"use client";

import React, { useEffect } from "react";
import type { PokemonInfo } from "@/features/pokedex/types";
import { useComplementaryPokemon } from "../hooks/useComplementaryPokemon";

interface ComplementaryPokemonResultProps {
    basePokemon: PokemonInfo;
}

export default function ComplementaryPokemonResult({ basePokemon }: ComplementaryPokemonResultProps) {
    // API通信フックをここで呼び出す
    const { data, isLoading, error, fetchComplements } = useComplementaryPokemon();

    // propsとして受け取った主軸ポケモンが変更されたら、自動でAPIを叩く
    useEffect(() => {
        if (basePokemon?.id) {
            fetchComplements(basePokemon.id);
        }
    }, [basePokemon, fetchComplements]);

    // ローディング中の表示
    if (isLoading) {
        return (
            <div className="mt-12 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">相性補完を計算中...</p>
            </div>
        );
    }

    // エラー発生時の表示
    if (error) {
        return (
            <div className="mt-12 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm">
                <p className="font-medium">{error}</p>
            </div>
        );
    }

    // 防衛的プログラミング：データが無い場合は空配列にする
    const complements = data?.complements || [];

    return (
        <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                    {basePokemon.name} の補完候補
                </h2>
                <span className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full">
                    {complements.length} 匹
                </span>
            </div>

            {complements.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {complements.map((pokemon) => (
                        <div 
                            key={pokemon.id} 
                            className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-bold text-slate-400 tracking-wider">
                                    RANK {pokemon.rank}
                                </span>
                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs text-slate-300">
                                    ?
                                </div>
                            </div>
                            <span className="text-lg font-bold text-slate-800 mb-4">
                                {pokemon.name}
                            </span>
                            <div className="flex gap-2 mt-auto">
                                {(pokemon.types || []).map((type) => (
                                    <span 
                                        key={type} 
                                        className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium"
                                    >
                                        {type}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                    <p className="text-slate-500">条件に合致する補完ポケモンが見つかりませんでした。</p>
                </div>
            )}
        </div>
    );
}