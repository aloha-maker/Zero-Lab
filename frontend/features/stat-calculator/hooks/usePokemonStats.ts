// frontend/features/stat-calculator/hooks/usePokemonStats.ts
import { useState, useEffect, useCallback } from "react";
import { ApiError } from "@/lib/api-client";
import type { PokemonInfo } from "@/features/pokedex/types";
import type { StatusRequest } from "@/features/stat-calculator/types";
import { NATURES, LEVEL, INDIVIDUAL_VALUE, createEmptyResults } from "@/features/stat-calculator/types";

import { STAT_KEYS, type PokemonStatKey, type ResultRecord, type StatusCalcProps } from "../types";
import { createInitialStats, clampEv } from "../utils/calculateStats";
import { calculateStatus } from "../api/calculateStatus";

export const usePokemonStats = ({ initialPokemon, initialPokemonName, onStatusUpdate }: StatusCalcProps) => {
    const [pokemon, setPokemon] = useState<PokemonInfo | null>(initialPokemon ?? null);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const currentPokemonName = pokemon?.name ?? (initialPokemonName || "");
    const [natureIndex, setNatureIndex] = useState(18);
    const [stats, setStats] = useState(() => createInitialStats(initialPokemon));

    const [results, setResults] = useState<ResultRecord>(() => createEmptyResults());
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);

    useEffect(() => {
        setStats(createInitialStats(pokemon));
        setResults(createEmptyResults());
    }, [pokemon]);

    useEffect(() => {
        if (onStatusUpdate) {
            const evs = STAT_KEYS.reduce((acc, key) => {
                acc[key] = stats[key].ev;
                return acc;
            }, {} as Record<PokemonStatKey, number>);

            onStatusUpdate({
                pokemon_id: pokemon?.id ?? 0,
                pokemon_name: pokemon?.name ?? "",
                nature: NATURES[natureIndex]?.name ?? "",
                evs,
            });
        }
    }, [pokemon, natureIndex, stats, onStatusUpdate]);

    const handleSearchStart = useCallback(() => setSearchError(null), []);

    const handleSearchSuccess = useCallback((data: PokemonInfo) => {
        setPokemon(data);
        setIsSearchOpen(false);
    }, []);

    const handleSearchError = useCallback((message: string) => setSearchError(message), []);

    const handleStatChange = useCallback((stat: PokemonStatKey, field: "base" | "ev", value: number) => {
        setStats((prev) => {
            // 入力された新しい値を決定（努力値の場合は上限/下限をクランプ）
            const newValue = field === "ev" ? clampEv(value) : value;

            // 既存の値と比較し、変更がなければ現在の状態(prev)をそのまま返す
            // これにより不要な再レンダリングと無限ループを防ぐ
            if (prev[stat][field] === newValue) {
                return prev;
            }

            // 値に変更がある場合のみ、新しいオブジェクトを生成して状態を更新
            return {
                ...prev,
                [stat]: {
                    ...prev[stat],
                    [field]: newValue,
                },
            };
        });
    }, []);

    const currentEVTotal = STAT_KEYS.reduce((sum, key) => sum + stats[key].ev, 0);

    const handleCalculate = useCallback(async () => {
        setIsLoading(true);
        setGlobalError(null);
        const selectedNature = NATURES[natureIndex];

        const settled = await Promise.allSettled(
            STAT_KEYS.map(async (key) => {
                let modifier = 1.0;
                if (selectedNature.up === key) modifier = 1.1;
                if (selectedNature.down === key) modifier = 0.9;

                const requestData: StatusRequest = {
                    base_stat: stats[key].base,
                    iv: INDIVIDUAL_VALUE,
                    ev: stats[key].ev,
                    level: LEVEL,
                    is_hp: key === "hp",
                    nature_modifier: modifier,
                };

                try {
                    // 共通APIクライアント経由の呼び出しへ変更
                    const data = await calculateStatus(requestData);
                    return { key, val: data.real_stat };
                } catch (err: unknown) {
                    console.error(`🔥 ステータス(${key})の計算に失敗しました:`, err);
                    
                    // usePokemonMaster と同様に ApiError のハンドリングを行う
                    if (err instanceof ApiError) {
                        throw new Error(`${key}: ${err.message}`);
                    }
                    throw new Error(`${key}: 予期せぬエラーが発生しました`);
                }
            })
        );

        const errors: string[] = [];

        setResults((prev) => {
            const next = { ...prev };
            settled.forEach((result) => {
                if (result.status === "fulfilled") {
                    next[result.value.key] = result.value.val;
                } else {
                    errors.push(
                        result.reason instanceof Error ? result.reason.message : "不明なエラーが発生しました。"
                    );
                }
            });
            return next;
        });

        if (errors.length > 0) {
            setGlobalError(errors.join(" / "));
        }

        setIsLoading(false);
    }, [natureIndex, stats]);

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
        currentEVTotal,
    };
};