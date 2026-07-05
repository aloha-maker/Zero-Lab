// frontend/features/stat-calculator/hooks/usePokemonStats.ts
import { useState, useEffect } from "react";
import type { ApiErrorResponse } from "@/lib/api-client";
import type { PokemonInfo } from "@/features/pokedex/types";
import type { StatusRequest, StatusResponse } from "@/features/stat-calculator/types";
import { API_URL } from "@/lib/api-client";
import { NATURES, LEVEL, INDIVIDUAL_VALUE } from "@/features/stat-calculator/types";

import { STAT_KEYS, type PokemonStatKey, type ResultRecord, type StatusCalcProps } from "../types";
import { NATURE_MAP, createInitialStats } from "../utils/calculateStats";

export const usePokemonStats = ({ initialPokemon, initialPokemonName, onStatusUpdate }: StatusCalcProps) => {
    const [pokemon, setPokemon] = useState<PokemonInfo | null>(initialPokemon ?? null);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const currentPokemonName = pokemon?.name ?? (initialPokemonName || "");
    const [natureIndex, setNatureIndex] = useState(18); 
    const [stats, setStats] = useState(() => createInitialStats(initialPokemon));

    const [results, setResults] = useState<ResultRecord>({
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

    const handleSearchStart = () => setSearchError(null);
    const handleSearchSuccess = (data: PokemonInfo) => {
        setPokemon(data);
        setIsSearchOpen(false);
    };
    const handleSearchError = (message: string) => setSearchError(message);

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

                // ※本来は lib/api-client.ts 経由で呼び出すのがベターです
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
                        errorMessage = errorData.detail.map((e: any) => e.msg).join(", ");
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

    return {
        currentPokemonName,
        natureIndex,
        setNatureIndex,
        stats,
        results,
        isLoading,
        globalError,
        isSearchOpen,
        setIsSearchOpen,
        searchError,
        handleSearchStart,
        handleSearchSuccess,
        handleSearchError,
        handleStatChange,
        handleCalculate,
        currentEVTotal
    };
};