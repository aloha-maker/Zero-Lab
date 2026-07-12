// frontend/features/matchup-filter/hooks/useMatchupFilter.ts
import { useCallback, useState } from "react";
import type { ComplementaryPokemon } from "@/features/type-complement/types";
import { filterMatchupCandidates } from "../api/filterMatchupCandidates";
import type { MatrixResultRow } from "@/features/TopTierMatchups/types";
import type { FilteredCandidate } from "../types";

interface UseMatchupFilterResult {
    filteredCandidates: FilteredCandidate[] | null;
    isLoading: boolean;
    error: string | null;
    runFilter: (
        candidates: ComplementaryPokemon[],
        targets: MatrixResultRow[]
    ) => Promise<void>;
    reset: () => void;
}

export function useMatchupFilter(): UseMatchupFilterResult {
    const [filteredCandidates, setFilteredCandidates] = useState<
        FilteredCandidate[] | null
    >(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runFilter = useCallback(
        async (candidates: ComplementaryPokemon[], targets: MatrixResultRow[]) => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await filterMatchupCandidates({ candidates, targets });
                setFilteredCandidates(response.filtered_candidates);
            } catch (err: unknown) {
                setError(
                    err instanceof Error ? err.message : "予期せぬエラーが発生しました"
                );
                setFilteredCandidates(null);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const reset = useCallback(() => {
        setFilteredCandidates(null);
        setError(null);
    }, []);

    return { filteredCandidates, isLoading, error, runFilter, reset };
}