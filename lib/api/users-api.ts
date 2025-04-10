import { apiClient } from "@/lib/api-client"

export const usersApi = {
  register: (data: any) => apiClient.post("/api/users/register", data),
  block: (data: any) => apiClient.post("/api/users/block", data),
  unblock: (data: any) => apiClient.post("/api/users/unblock", data),
  mute: (data: any) => apiClient.post("/api/users/mute", data),
  search: (email: string) => apiClient.get(`/api/users/search?email=${email}`),
}
