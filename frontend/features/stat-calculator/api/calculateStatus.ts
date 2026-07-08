// frontend/features/stat-calculator/api/calculateStatus.ts
import { apiClient } from "@/lib/api-client";
import type { StatusRequest, StatusResponse } from "../types";

export async function calculateStatus(requestData: StatusRequest): Promise<StatusResponse> {
    // apiClientが /api/v1 などのベースURLや共通エラーハンドリングを持つ想定
    return apiClient.post<StatusResponse>("/status", requestData);
}