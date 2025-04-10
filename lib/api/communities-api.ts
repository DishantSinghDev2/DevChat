import { apiClient } from "@/lib/api-client"

export const communitiesApi = {
  create: (data: any) => apiClient.post("/api/communities/create", data),
  getDetails: (communityId: string) => apiClient.get(`/api/communities/${communityId}`),
  join: (data: any) => apiClient.post("/api/communities/join", data),
  leave: (data: any) => apiClient.post("/api/communities/leave", data),
  createChannel: (data: any) => apiClient.post("/api/communities/channel/create", data),
  getChannels: (communityId: string) => apiClient.get(`/api/communities/${communityId}/channels`),
  getUserCommunities: (userId: string) => apiClient.get(`/api/communities/user/${userId}`),
}
