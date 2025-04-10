import { apiClient } from "@/lib/api-client"

export const channelMessagesApi = {
  send: (data: any) => apiClient.post("/api/channel-messages/send", data),
  getMessages: (channelId: string) => apiClient.get(`/api/channel-messages/${channelId}`),
  pin: (data: any) => apiClient.post("/api/channel-messages/pin", data),
  getPinned: (channelId: string) => apiClient.get(`/api/channel-messages/${channelId}/pinned`),
}
