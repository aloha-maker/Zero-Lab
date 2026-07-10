"use client";

import { useState, useMemo, useCallback } from "react";
import type { SeasonPokemonInfo, RealDamageRankingResult } from "@/app/types/api";
import { API_URL } from '@/lib/api-client';
import { SeasonPokemonResponse, SortKey, SortOrder } from "../types";

export function useSeasonData() {
    const [pokemonList, setPokemonList] = useState<SeasonPokemonInfo[]>([]);
    const [realDamageRanking, setRealDamageRanking] = useState<RealDamageRankingResult[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false); // 初期値はfalseに
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState<boolean>(false); // 検索ボタンが押されたかのフラグ

    const [sortKey, setSortKey] = useState<SortKey>("rank");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

    // 検索ボタンから実行する関数
    const fetchSeasonPokemons = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const res = await fetch(`${API_URL}/api/v1/seasons/latest_pokemons`);
            if (!res.ok) {
                throw new Error("データの取得に失敗しました");
            }
            const data: SeasonPokemonResponse = await res.json();
            setPokemonList(data.pokemons || []);
            setRealDamageRanking(data.real_damage_ranking || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "予期せぬエラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }
    };

    const sortedPokemonList = useMemo(() => {
        const list = [...pokemonList];
        return list.sort((a, b) => {
            let valA: string | number = "";
            let valB: string | number = "";

            if (sortKey === "rank") {
                valA = pokemonList.indexOf(a) + 1;
                valB = pokemonList.indexOf(b) + 1;
            } else if (sortKey === "id" || sortKey === "name") {
                valA = a[sortKey];
                valB = b[sortKey];
            } else {
                valA = a.base_stats[sortKey] ?? 0;
                valB = b.base_stats[sortKey] ?? 0;
            }

            if (typeof valA === "string" && typeof valB === "string") {
                return sortOrder === "asc" 
                    ? valA.localeCompare(valB, "ja") 
                    : valB.localeCompare(valA, "ja");
            } else {
                return sortOrder === "asc"
                    ? (valA as number) - (valB as number)
                    : (valB as number) - (valA as number);
            }
        });
    }, [pokemonList, sortKey, sortOrder]);

    return {
        pokemonList,
        sortedPokemonList,
        realDamageRanking,
        isLoading,
        error,
        hasSearched,
        sortKey,
        sortOrder,
        handleSort,
        fetchSeasonPokemons
    };
}