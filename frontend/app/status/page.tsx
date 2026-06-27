"use client";

import { useState } from "react";
import PokemonSearchForm from "../pokedex/components/PokemonSearchForm";
import StatusCalc,{ BaseStats } from "./components/StatusCalc";
import type { PokemonInfo } from "@/app/types/api";

export default function MainPage() {
    const [pokemon, setPokemon] = useState<PokemonInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedPokemon, setSelectedPokemon] = useState<"gaburiasu" | "habakami">("gaburiasu");

    // 検索が始まったら、前の状態をクリアする
    const handleSearchStart = () => {
        setError(null);
        setPokemon(null);
    };

    // 検索成功時の処理
    const handleSearchSuccess = (data: PokemonInfo) => {
        setPokemon(data);
    };

    // 検索失敗時の処理
    const handleSearchError = (message: string) => {
        setError(message);
    };

    // ステータス計算に渡すときのインターフェース
    const getInitialBaseStats = (): BaseStats => {
        if (pokemon?.base_stats) {
            return {
                hp: pokemon.base_stats["hp"] ?? 0,
                atk: pokemon.base_stats["attack"] ?? 0,
                def: pokemon.base_stats["defense"] ?? 0,
                spa: pokemon.base_stats["special-attack"] ?? 0,
                spd: pokemon.base_stats["special-defense"] ?? 0,
                spe: pokemon.base_stats["speed"] ?? 0,
            };
        }
        return { hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102 };
    };

    return (
        <main className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">ポケモンステータス計算</h1>

            {/* 切り出した検索フォームコンポーネント */}
            <PokemonSearchForm 
                onSearchStart={handleSearchStart}
                onSearchSuccess={handleSearchSuccess}
                onSearchError={handleSearchError}
            />

            {/* 引数を渡して呼び出す */}
            <StatusCalc initialBaseStats={getInitialBaseStats()} />
        </main>
    );
}