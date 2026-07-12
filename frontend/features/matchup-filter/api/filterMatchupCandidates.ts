// frontend/features/matchup-filter/api/filterMatchupCandidates.ts
import { apiClient, ApiError } from "@/lib/api-client";
import type { MatchupFilterRequest, MatchupFilterResponse } from "../types";

/**
 * 相性補完候補(candidates)を、苦手な相手(targets)に対する勝率で絞り込む
 * POST /api/v1/strategy/step2-filter
 */
export async function filterMatchupCandidates(
    payload: MatchupFilterRequest
): Promise<MatchupFilterResponse> {
    try {
        // apiClient側でプレフィックスが付与されるため "/strategy/step2-filter" とします
        return await apiClient.post<MatchupFilterResponse>(
            "/strategy/step2-filter",
            payload
        );
    } catch (err: unknown) {
        if (err instanceof ApiError) {
            throw new Error(err.message);
        } else {
            throw new Error("予期せぬエラーが発生しました");
        }
    }
}