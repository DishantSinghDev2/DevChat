import { apiClient } from "@/lib/api-client"

export const groupsApi = {
  create: (data: any) => apiClient.post("/api/groups/create", data),
  getDetails: (groupId: string) => apiClient.get(`/api/groups/${groupId}`),
  addMembers: (data: any) => apiClient.post("/api/groups/members/add", data),
  removeMembers: (data: any) => apiClient.post("/api/groups/members/remove", data),
  updateSettings: (data: any) => apiClient.post("/api/groups/settings", data),
  changeRole: (data: any) => apiClient.post("/api/groups/members/role", data),
  getUserGroups: (userId: string) => apiClient.get(`/api/groups/user/${userId}`),
  delete: (data: any) => apiClient.post("/api/groups/delete", data),
}
