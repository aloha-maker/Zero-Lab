"use client";

import { useState } from "react";
import StatusCalc from "./components/StatusCalc";

// ダミーのポケモンマスターデータ
const POKEMON_DATABASE = {
    gaburiasu: { hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102 },
    habakami: { hp: 55, atk: 55, def: 55, spa: 135, spd: 135, spe: 135 },
};

export default function MainPage() {
    const [selectedPokemon, setSelectedPokemon] = useState<"gaburiasu" | "habakami">("gaburiasu");

    return (
        <main className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">ポケモンステータス計算</h1>
            
            {/* ポケモン切り替えボタン */}
            <div className="flex gap-4 mb-6">
                <button 
                    onClick={() => setSelectedPokemon("gaburiasu")}
                    className={`px-4 py-2 rounded ${selectedPokemon === "gaburiasu" ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-800"}`}
                >
                    ガブリアス
                </button>
                <button 
                    onClick={() => setSelectedPokemon("habakami")}
                    className={`px-4 py-2 rounded ${selectedPokemon === "habakami" ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-800"}`}
                >
                    ハバタクカミ
                </button>
            </div>

            {/* 引数を渡して呼び出す */}
            <StatusCalc 
                initialBaseStats={POKEMON_DATABASE[selectedPokemon]} 
            />
        </main>
    );
}