import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null

export const initializeSocket = (userId: string): Socket => {
  if (socket) return socket

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || ""
  if (!socketUrl) {
    console.error("Socket URL not configured")
    throw new Error("Socket URL not configured")
  }

  socket = io(socketUrl, {
    auth: {
      userId,
    },
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
  })

  socket.on("connect", () => {
    console.log("Socket connected")
  })

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason)
  })

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error)
  })

  return socket
}

export const getSocket = (): Socket | null => {
  return socket
}

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export { socket }
