import { apiClient } from "@/lib/api-client"

export const groupMessagesApi = {
  send: (data: any) => apiClient.post("/api/group-messages/send", data),
  getMessages: (groupId: string) => apiClient.get(`/api/group-messages/${groupId}`),
  react: (data: any) => apiClient.post("/api/group-messages/react", data),
  delete: (data: any) => apiClient.post("/api/group-messages/delete", data),
  updateStatus: (data: any) => apiClient.post("/api/group-messages/status", data),
}
