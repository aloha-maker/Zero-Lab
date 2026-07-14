import { apiClient } from "@/lib/api-client";
import { BulkMatrixRequest, BulkMatrixResponse } from "../types";

export const fetchBulkMatrix = async (request: BulkMatrixRequest): Promise<BulkMatrixResponse> => {
  // apiClient内でAPI_PREFIX(/api/v1)が付与されるため、エンドポイントは "strategy/bulk-matrix"
  return apiClient.post<BulkMatrixResponse>("strategy/bulk-matrix", request);
};