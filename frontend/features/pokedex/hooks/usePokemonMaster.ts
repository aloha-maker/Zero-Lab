// src/features/pokedex/hooks/usePokemonMaster.ts
import { useState, useEffect } from "react";
import type { CandidatePokemon } from "../types";

export const usePokemonMaster = () => {
    const [candidates, setCandidates] = useState<CandidatePokemon[]>([]);
    const [isMasterLoading, setIsMasterLoading] = useState(true);

    useEffect(() => {
        const fetchPokemonMaster = async () => {
            // 日本語名と英名（name）、IDを取得するGraphQLクエリ
            const query = `
                query getPokemonMaster {
                    pokemon_v2_pokemon {
                        id
                        name
                        pokemon_v2_pokemonspecy {
                            pokemon_v2_pokemonspeciesnames(where: {language_id: {_eq: 1}}) {
                                name
                            }
                        }
                    }
                }
            `;

            try {
                const res = await fetch('https://beta.pokeapi.co/graphql/v1beta', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query }),
                });

                if (!res.ok) throw new Error('PokeAPI GraphQL request failed');

                const { data } = await res.json();
                
                // 配列形式にマッピングしてステートに保存
                const mappedCandidates: CandidatePokemon[] = data.pokemon_v2_pokemon.map((p: any) => {
                    const jaName = p.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonspeciesnames?.[0]?.name || p.name;
                    return {
                        id: p.id,
                        name: p.name, // 英名 (API検索用)
                        jaName: jaName, // 日本語名 (表示用)
                        imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`
                    };
                });

                setCandidates(mappedCandidates);
            } catch (error) {
                console.error('🔥 PokeAPIマスターフェッチに失敗しました:', error);
            } finally {
                setIsMasterLoading(false);
            }
        };

        fetchPokemonMaster();
    }, []);

    return { candidates, isMasterLoading };
};