// src/features/pokedex/hooks/usePokemonMaster.ts
import { useState, useEffect } from "react";
import type { CandidatePokemon } from "../types";

interface UsePokemonMasterResult {
    candidates: CandidatePokemon[];
    isMasterLoading: boolean;
    error: string | null;
}

interface PokemonSpeciesName {
    name: string;
}

interface PokemonSpecy {
    pokemonspeciesnames: PokemonSpeciesName[];
}

interface RawPokemon {
    id: number;
    name: string;
    pokemonspecy: PokemonSpecy | null;
}

interface PokemonMasterResponse {
    data: {
        pokemon: RawPokemon[];
    } | null;
    errors?: { message: string }[];
}

// v1beta(beta.pokeapi.co)は廃止済み。新エンドポイントに移行。
// https://pokeapi.co/docs/graphql 参照
const POKEAPI_GRAPHQL_ENDPOINT = 'https://graphql.pokeapi.co/v1beta2';

export const usePokemonMaster = (): UsePokemonMasterResult => {
    const [candidates, setCandidates] = useState<CandidatePokemon[]>([]);
    const [isMasterLoading, setIsMasterLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchPokemonMaster = async () => {
            // v1beta2ではpokemon_v2_接頭辞が廃止されている
            const query = `
                query getPokemonMaster {
                    pokemon {
                        id
                        name
                        pokemonspecy {
                            pokemonspeciesnames(where: {language_id: {_eq: 1}}) {
                                name
                            }
                        }
                    }
                }
            `;

            try {
                const res = await fetch(POKEAPI_GRAPHQL_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query }),
                    signal: controller.signal,
                });

                if (!res.ok) throw new Error(`PokeAPI GraphQL request failed: ${res.status}`);

                const { data, errors }: PokemonMasterResponse = await res.json();

                if (errors?.length) {
                    throw new Error(errors[0]?.message ?? 'Unknown GraphQL error');
                }
                if (!data?.pokemon) {
                    throw new Error('Unexpected response shape: pokemon missing');
                }

                const mappedCandidates: CandidatePokemon[] = data.pokemon.map((p) => {
                    const jaName =
                        p.pokemonspecy?.pokemonspeciesnames?.[0]?.name || p.name;
                    return {
                        id: p.id,
                        name: p.name,
                        jaName,
                        imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`,
                    };
                });

                setCandidates(mappedCandidates);
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError') return;

                const message = err instanceof Error ? err.message : 'Unknown error';
                console.error('🔥 PokeAPIマスターフェッチに失敗しました:', err);
                setError(message);
            } finally {
                if (!controller.signal.aborted) {
                    setIsMasterLoading(false);
                }
            }
        };

        fetchPokemonMaster();
        return () => controller.abort();
    }, []);

    return { candidates, isMasterLoading, error };
};