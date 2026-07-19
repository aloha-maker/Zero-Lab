import { OneVsOneRequest, OneVsOneResponse } from "../types";
import { apiClient } from "@/lib/api-client";

export async function fetch1v1Matrix(request: OneVsOneRequest): Promise<OneVsOneResponse> {
  const response = await apiClient.post<OneVsOneResponse>("/strategy/1v1-matrix", request);
  return response;
}