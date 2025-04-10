import { apiClient } from "@/lib/api-client"

export const analyticsApi = {
  getUserStats: (userId: string) => apiClient.get(`/api/analytics/user/${userId}`),
  getActiveChats: (userId: string) => apiClient.get(`/api/analytics/active-chats/${userId}`),
  getMessageCount: (userId: string) => apiClient.get(`/api/analytics/message-count/${userId}`),
}
