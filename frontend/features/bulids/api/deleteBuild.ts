import { apiClient } from "@/lib/api-client";

export async function deleteBuild(id: string): Promise<void> {
  return apiClient.delete<void>(`/builds/${id}`);
}
