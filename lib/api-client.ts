import axios from "axios"

// Create an Axios instance with default config
export const apiClient = axios.create({
  baseURL: "https://secure-messaging-api.p.rapidapi.com",
  headers: {
    "Content-Type": "application/json",
    "x-rapidapi-key": process.env.RAPIDAPI_KEY || "",
    "x-rapidapi-host": "secure-messaging-api.p.rapidapi.com",
  },
})

// Add a request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = process.env.API_TOKEN
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Log errors or handle them globally
    console.error("API Error:", error.response?.data || error.message)

    // Implement retry logic for network errors
    if (error.code === "ECONNABORTED" || !error.response) {
      const config = error.config
      // Only retry once
      if (!config || !config._retry) {
        if (config) {
          config._retry = true
          return apiClient(config)
        }
      }
    }

    return Promise.reject(error)
  },
)

// User Management
export const usersApi = {
  register: (data: any) => apiClient.post("/api/users/register", data),
  block: (data: any) => apiClient.post("/api/users/block", data),
  unblock: (data: any) => apiClient.post("/api/users/unblock", data),
  mute: (data: any) => apiClient.post("/api/users/mute", data),
  search: (email: string) => apiClient.get(`/api/users/search?email=${email}`),
}

// Direct Messaging
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

// Group Management
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

// Group Messaging
export const groupMessagesApi = {
  send: (data: any) => apiClient.post("/api/group-messages/send", data),
  getMessages: (groupId: string) => apiClient.get(`/api/group-messages/${groupId}`),
  react: (data: any) => apiClient.post("/api/group-messages/react", data),
  delete: (data: any) => apiClient.post("/api/group-messages/delete", data),
  updateStatus: (data: any) => apiClient.post("/api/group-messages/status", data),
}

// Communities
export const communitiesApi = {
  create: (data: any) => apiClient.post("/api/communities/create", data),
  getDetails: (communityId: string) => apiClient.get(`/api/communities/${communityId}`),
  join: (data: any) => apiClient.post("/api/communities/join", data),
  leave: (data: any) => apiClient.post("/api/communities/leave", data),
  createChannel: (data: any) => apiClient.post("/api/communities/channel/create", data),
  getChannels: (communityId: string) => apiClient.get(`/api/communities/${communityId}/channels`),
  getUserCommunities: (userId: string) => apiClient.get(`/api/communities/user/${userId}`),
}

// Channel Messaging
export const channelMessagesApi = {
  send: (data: any) => apiClient.post("/api/channel-messages/send", data),
  getMessages: (channelId: string) => apiClient.get(`/api/channel-messages/${channelId}`),
  pin: (data: any) => apiClient.post("/api/channel-messages/pin", data),
  getPinned: (channelId: string) => apiClient.get(`/api/channel-messages/${channelId}/pinned`),
}

// Status Updates
export const statusesApi = {
  create: (data: any) => apiClient.post("/api/statuses/create", data),
  getUserStatuses: (userId: string) => apiClient.get(`/api/statuses/user/${userId}`),
  getDetails: (statusId: string) => apiClient.get(`/api/statuses/${statusId}`),
  delete: (data: any) => apiClient.post("/api/statuses/delete", data),
  getViewers: (statusId: string) => apiClient.get(`/api/statuses/${statusId}/viewers`),
}

// Media
export const mediaApi = {
  upload: (data: FormData) =>
    apiClient.post("/api/media/upload", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  get: (fileId: string) => apiClient.get(`/api/media/${fileId}`),
}

// Analytics
export const analyticsApi = {
  getUserStats: (userId: string) => apiClient.get(`/api/analytics/user/${userId}`),
  getActiveChats: (userId: string) => apiClient.get(`/api/analytics/active-chats/${userId}`),
  getMessageCount: (userId: string) => apiClient.get(`/api/analytics/message-count/${userId}`),
}

// Health check
export const healthApi = {
  check: () => apiClient.get("/api/health"),
}
