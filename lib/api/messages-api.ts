import { apiClient } from "@/lib/api-client"

export const messagesApi = {
  send: (data: any) => apiClient.post("/api/messages/send", data),
  getChat: (userId: string, recipientId: string) => apiClient.get(`/api/messages/${userId}/${recipientId}`),
  sendTyping: (data: any) => apiClient.post("/api/messages/typing", data),
  reply: (data: any) => apiClient.post("/api/messages/reply", data),
  react: (data: any) => apiClient.post("/api/messages/react", data),
  delete: (data: any) => apiClient.post("/api/messages/delete", data),
  schedule: (data: any) => apiClient.post("/api/messages/schedule", data),
  updateStatus: (data: any) => apiClient.post("/api/status", data),
  getStatus: (messageId: string) => apiClient.get(`/api/status/${messageId}`),
}
