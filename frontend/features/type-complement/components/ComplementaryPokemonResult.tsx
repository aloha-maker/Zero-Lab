"use client";

import React, { useEffect, useState } from "react";
import type { PokemonInfo } from "@/features/pokedex/types";
import type { ComplementaryResponse } from "../types";
import { useComplementaryPokemon } from "../hooks/useComplementaryPokemon";

interface ComplementaryPokemonResultProps {
    basePokemon: PokemonInfo;
    onResultFetched?: (result: ComplementaryResponse) => void;
}

export default function ComplementaryPokemonResult({ 
    basePokemon, 
    onResultFetched 
}: ComplementaryPokemonResultProps) {
    const { data, isLoading, error, fetchComplements } = useComplementaryPokemon();
    // 【追加】リストの開閉状態を管理するState（初期値は開いた状態）
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        if (basePokemon?.id) {
            fetchComplements(basePokemon.id);
            // 新しいポケモンを検索した時は自動で開く
            setIsOpen(true);
        }
    }, [basePokemon, fetchComplements]);

    useEffect(() => {
        if (data && onResultFetched) {
            onResultFetched(data);
        }
    }, [data, onResultFetched]);

    if (isLoading) {
        return (
            <div className="mt-12 text-center p-8 bg-white rounded-xl border border-slate-200">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">相性補完候補を検索中...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-12 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm">
                <p className="font-medium">{error}</p>
            </div>
        );
    }

    const complements = data?.complements || [];

    return (
        <div className="mt-12">
            {/* 【変更】ヘッダー全体をクリック可能にし、開閉のトグル処理を追加 */}
            <div 
                className="flex items-center justify-between mb-4 gap-4 cursor-pointer hover:bg-slate-50 p-2 -ml-2 rounded-lg transition-colors select-none group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-800">
                            {basePokemon.name} の補完候補
                        </h2>
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full">
                            {complements.length} 匹
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1.5">
                        タイプ相性で苦手なものが主軸ポケモンと被らない一覧
                    </p>
                </div>
                
                {/* 【追加】開閉状態を示すアイコン（矢印） */}
                <div className="text-slate-400 pr-2 group-hover:text-indigo-500 transition-colors">
                    <svg 
                        className={`w-6 h-6 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* 【追加】isOpen が true の時だけリストを表示する */}
            {isOpen && (
                complements.length > 0 ? (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        {complements.map((pokemon) => (
                            <div 
                                key={pokemon.id} 
                                className="bg-white px-4 py-3 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between hover:bg-slate-50 hover:border-indigo-200 transition-colors gap-3 overflow-hidden"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 sm:w-16 flex flex-col shrink-0">
                                        <span className="text-[10px] font-bold text-slate-400 tracking-wider">RANK</span>
                                        <span className="text-sm font-bold text-slate-700">{pokemon.rank}</span>
                                    </div>
                                    
                                    <div className="text-sm sm:text-base font-bold text-slate-900 whitespace-nowrap truncate">
                                        {pokemon.name}
                                    </div>
                                </div>

                                <div className="flex gap-1.5 sm:gap-2 items-center shrink-0">
                                    {(pokemon.types || []).map((type) => (
                                        <span 
                                            key={type} 
                                            className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] sm:text-xs rounded font-medium whitespace-nowrap"
                                        >
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-300">
                        <p className="text-slate-500 font-medium">条件に合致する補完ポケモンが見つかりませんでした。</p>
                    </div>
                )
            )}
        </div>
    );
}