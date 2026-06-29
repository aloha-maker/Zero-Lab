"use client";

import { useState, useEffect } from "react";
import type { PokemonInfo, StatusRequest, StatusResponse, ApiErrorResponse } from "@/app/types/api";
import { NATURES, API_URL, LEVEL, INDIVIDUAL_VALUE } from "@/app/types/constants";
import PokemonSearchModal from "../../pokedex/components/PokemonSearchModal"; 

// ==========================================
// TYPES & INTERFACES
// ==========================================
const STAT_KEYS = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"] as const;
type PokemonStatKey = typeof STAT_KEYS[number];

const NATURE_MAP: Record<PokemonStatKey, string> = {
    "hp": "H", "attack": "A", "defense": "B", "special-attack": "C", "special-defense": "D", "speed": "S"
};

const DEFAULT_BASE_STATS: Record<PokemonStatKey, number> = {
    "hp": 0, "attack": 0, "defense": 0, "special-attack": 0, "special-defense": 0, "speed": 0
};

const createInitialStats = (pokemon?: PokemonInfo | null) => {
    const statsHashes = {} as Record<PokemonStatKey, { base: number; ev: number }>;
    STAT_KEYS.forEach((key) => {
        statsHashes[key] = {
            base: pokemon?.base_stats[key] ?? DEFAULT_BASE_STATS[key],
            ev: 0,
        };
    });
    return statsHashes;
};
// ==========================================
// Props
// ==========================================
interface StatusCalcProps {
    initialPokemon?: PokemonInfo | null;
    initialPokemonName?: string;
    onStatusUpdate?: (data: {
        pokemon_id?: number;
        pokemon_name?: string;
        nature?: string;
        evs?: { H: number; A: number; B: number; C: number; D: number; S: number };
    }) => void;
}

// ==========================================
// DEFAULT FUNCTION
// ==========================================
export default function StatusCalc({ 
    initialPokemon = null,
    initialPokemonName = "",
    onStatusUpdate
}: StatusCalcProps) {

    const [pokemon, setPokemon] = useState<PokemonInfo | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const currentPokemonName = pokemon?.name ?? initialPokemonName;
    const [natureIndex, setNatureIndex] = useState(18); 
    const [stats, setStats] = useState(() => createInitialStats(initialPokemon));

    const [results, setResults] = useState<Record<PokemonStatKey, number | null>>({
        "hp": null, "attack": null, "defense": null, "special-attack": null, "special-defense": null, "speed": null
    });
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);

    useEffect(() => {
        setStats(createInitialStats(pokemon));
        setResults({ "hp": null, "attack": null, "defense": null, "special-attack": null, "special-defense": null, "speed": null });
    }, [pokemon]);

    useEffect(() => {
        if (onStatusUpdate) {
            onStatusUpdate({
                pokemon_id: pokemon?.id ?? 0,
                pokemon_name: pokemon?.name ?? "",
                nature: NATURES[natureIndex]?.name ?? "",
                evs: {
                    H: stats["hp"].ev,
                    A: stats["attack"].ev,
                    B: stats["defense"].ev,
                    C: stats["special-attack"].ev,
                    D: stats["special-defense"].ev,
                    S: stats["speed"].ev,
                }
            });
        }
    }, [pokemon, natureIndex, stats, onStatusUpdate]);

    const handleSearchStart = () => {
        setSearchError(null);
    };

    const handleSearchSuccess = (data: PokemonInfo) => {
        setPokemon(data);
        setIsSearchOpen(false);
    };

    const handleSearchError = (message: string) => {
        setSearchError(message);
    };

    const handleStatChange = (stat: PokemonStatKey, field: 'base' | 'ev', value: number) => {
        setStats(prev => ({
            ...prev,
            [stat]: { ...prev[stat], [field]: value }
        }));
    };

    const currentEVTotal = STAT_KEYS.reduce((sum, key) => sum + stats[key].ev, 0);

    const handleCalculate = async () => {
        setIsLoading(true);
        setGlobalError(null);

        const selectedNature = NATURES[natureIndex];

        try {
            const promises = STAT_KEYS.map(async (key) => {
                let modifier = 1.0;
                const natureChar = NATURE_MAP[key];
                
                if (natureChar !== 'H') {
                    if (selectedNature.up === natureChar) modifier = 1.1;
                    if (selectedNature.down === natureChar) modifier = 0.9;
                }

                const requestData: StatusRequest = {
                    base_stat: stats[key].base,
                    iv: INDIVIDUAL_VALUE, 
                    ev: stats[key].ev,
                    level: LEVEL,
                    is_hp: key === 'hp',
                    nature_modifier: modifier
                };

                const response = await fetch(`${API_URL}/api/v1/status`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestData),
                });

                if (!response.ok) {
                    const errorData = (await response.json()) as ApiErrorResponse;
                    let errorMessage = "通信エラー";
                    if (typeof errorData.detail === 'string') {
                        errorMessage = errorData.detail;
                    } else if (Array.isArray(errorData.detail)) {
                        errorMessage = errorData.detail.map(e => e.msg).join(", ");
                    }
                    throw new Error(`${key}: ${errorMessage}`);
                }

                const data = (await response.json()) as StatusResponse;
                return { key, val: data.real_stat };
            });

            const resArray = await Promise.all(promises);
            const newResults = { ...results };
            resArray.forEach(r => { newResults[r.key] = r.val; });
            setResults(newResults);

        } catch (error: any) {
            console.error("Error:", error);
            setGlobalError(error.message || "サーバーとの通信に失敗しました。");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 text-slate-100">
            <div className="mb-8 flex flex-col sm:flex-row">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 truncate">
                            {currentPokemonName}
                        </h2>
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="bg-slate-900 hover:bg-slate-950 text-slate-300 border border-slate-700 hover:border-indigo-500/50 p-2 rounded-lg transition-all shadow-sm flex items-center justify-center shrink-0"
                            title="ポケモンを検索"
                            type="button"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="w-full sm:w-64 shrink-0">
                    <select
                        value={natureIndex}
                        onChange={(e) => setNatureIndex(Number(e.target.value))}
                        className="w-full border border-slate-700 rounded-lg p-2 bg-slate-900 text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm"
                    >
                        {NATURES.map((n, i) => (
                            <option key={i} value={i}>{n.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto mb-8">
                <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                        <tr className="bg-slate-800 text-slate-300 text-sm">
                            <th className="p-3 border-b border-slate-700 font-bold w-1/5">ステータス</th>
                            <th className="p-3 border-b border-slate-700 font-bold text-center w-1/5">種族値</th>
                            <th className="p-3 border-b border-slate-700 font-bold text-center w-2/5">努力値</th>
                            <th className="p-3 border-b border-slate-700 font-bold text-center w-1/5">実数値</th>
                        </tr>
                    </thead>
                    <tbody>
                        {STAT_KEYS.map(key => {
                            const natureChar = NATURE_MAP[key];
                            const selectedNature = NATURES[natureIndex];
                            
                            const isUp = key !== 'hp' && selectedNature.up === natureChar;
                            const isDown = key !== 'hp' && selectedNature.down === natureChar;

                            return (
                                <tr key={key} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors">
                                    <td className="p-3 font-bold text-slate-200 uppercase text-xs tracking-wider">
                                        {key}
                                        {isUp && <span className="text-red-400 ml-1">▲</span>}
                                        {isDown && <span className="text-blue-400 ml-1">▼</span>}
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            type="number" 
                                            value={stats[key].base} 
                                            disabled
                                            className="w-full border border-slate-800 rounded p-1.5 text-center outline-none text-slate-400 bg-slate-950 cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <div className="flex items-center gap-2 justify-center">
                                            <input
                                                type="range"
                                                min={0}
                                                max={32}
                                                step={1}
                                                value={stats[key].ev}
                                                onChange={(e) => handleStatChange(key, 'ev', parseInt(e.target.value) || 0)}
                                                className="flex-1 accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer hidden md:block"
                                            />
                                            <input
                                                type="number"
                                                min={0}
                                                max={32}
                                                step={1}
                                                value={stats[key].ev}
                                                onChange={(e) => handleStatChange(key, 'ev', parseInt(e.target.value) || 0)}
                                                className="w-16 text-center bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg py-1 text-xs font-bold text-slate-100 focus:outline-none"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="bg-indigo-950/50 border border-indigo-500/30 text-indigo-400 font-extrabold text-xl py-1 rounded-lg min-h-[36px] flex items-center justify-center">
                                            {results[key] !== null ? results[key] : <span className="text-indigo-900">-</span>}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="bg-slate-850/60 px-6 py-4 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="w-full sm:w-auto flex-1 max-w-sm">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-1.5">
                        <span>努力値の合計配分</span>
                        <span className={`${currentEVTotal > 66 ? 'text-red-400' : 'text-slate-200'}`}>
                            {currentEVTotal} / 66
                        </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/60">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${
                                currentEVTotal > 66 ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-pink-500'
                            }`}
                            style={{ width: `${Math.min(100, (currentEVTotal / 66) * 100)}%` }}
                        ></div>
                    </div>
                </div>
                <button
                    onClick={handleCalculate}
                    disabled={isLoading}
                    className="w-full sm:w-auto min-w-[120px] bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-base hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 active:transform active:scale-[0.99] whitespace-nowrap"
                >
                    {isLoading ? "計算中..." : "計算する"}
                </button>
            </div>

            {globalError && (
                <div className="mb-6 p-4 bg-red-950/50 border-l-4 border-red-500 text-red-200 rounded-r">
                    <p className="font-bold">エラー</p>
                    <p>{globalError}</p>
                </div>
            )}

            {/* 切り出したダイアログコンポーネントを配置 */}
            <PokemonSearchModal 
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSearchStart={handleSearchStart}
                onSearchSuccess={handleSearchSuccess}
                onSearchError={handleSearchError}
                searchError={searchError}
            />
        </div>
    );
}