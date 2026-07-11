import { apiClient, ApiError } from "@/lib/api-client";
import { MatrixResponse } from "../types";

export interface MatchupMatrixRequest {
  main_pokemon_name: string;
  nature: string;
  evs?: Record<string, number> | {};
}

export async function getMatchupMatrix(params: MatchupMatrixRequest): Promise<MatrixResponse> {
  try {
    // apiClient側でプレフィックスが付与される前提でパスを指定
    return await apiClient.post<MatrixResponse>("/strategy/matrix", params);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      // apiClient で構築済みのエラーメッセージを標準のErrorとして投げる[cite: 4]
      throw new Error(err.message);
    } else {
      throw new Error("予期せぬエラーが発生しました"); //[cite: 4]
    }
  }
}