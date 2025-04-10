import axios from "axios"

// Create an Axios instance with default config
export const apiClient = axios.create({
  baseURL: "https://secure-messaging-api.p.rapidapi.com",
  headers: {
    "Content-Type": "application/json",
    "x-rapidapi-key": process.env.RAPIDAPI_KEY || "e973e51e4amshab2d42c92a50214p178e13jsn7ddbd1e429f2",
    "x-rapidapi-host": "secure-messaging-api.p.rapidapi.com",
  },
})

// Add a request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
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

    // You can implement retry logic here for certain errors

    return Promise.reject(error)
  },
)

// Export specific API functions for different endpoints
export const messagesApi = {
  send: (data: any) => apiClient.post("/api/messages/send", data),
  getChat: (userId: string, recipientId: string) => apiClient.get(`/api/messages/${userId}/${recipientId}`),
  sendTyping: (data: any) => apiClient.post("/api/messages/typing", data),
  reply: (data: any) => apiClient.post("/api/messages/reply", data),
  react: (data: any) => apiClient.post("/api/messages/react", data),
  delete: (data: any) => apiClient.post("/api/messages/delete", data),
  schedule: (data: any) => apiClient.post("/api/messages/schedule", data),
}

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

export const communitiesApi = {
  create: (data: any) => apiClient.post("/api/communities/create", data),
  getDetails: (communityId: string) => apiClient.get(`/api/communities/${communityId}`),
  join: (data: any) => apiClient.post("/api/communities/join", data),
  leave: (data: any) => apiClient.post("/api/communities/leave", data),
  createChannel: (data: any) => apiClient.post("/api/communities/channel/create", data),
  getChannels: (communityId: string) => apiClient.get(`/api/communities/${communityId}/channels`),
  getUserCommunities: (userId: string) => apiClient.get(`/api/communities/user/${userId}`),
}

export const mediaApi = {
  upload: (data: FormData) =>
    apiClient.post("/api/media/upload", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  get: (fileId: string) => apiClient.get(`/api/media/${fileId}`),
}

export const analyticsApi = {
  getUserStats: (userId: string) => apiClient.get(`/api/analytics/user/${userId}`),
  getActiveChats: (userId: string) => apiClient.get(`/api/analytics/active-chats/${userId}`),
  getMessageCount: (userId: string) => apiClient.get(`/api/analytics/message-count/${userId}`),
}

export const usersApi = {
  register: (data: any) => apiClient.post("/api/users/register", data),
  block: (data: any) => apiClient.post("/api/users/block", data),
  unblock: (data: any) => apiClient.post("/api/users/unblock", data),
  mute: (data: any) => apiClient.post("/api/users/mute", data),
}
