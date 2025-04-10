"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useSession } from "next-auth/react"

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user?.id) return

    // Initialize socket connection with proper error handling
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || ""
    if (!socketUrl) {
      console.error("Socket URL not configured")
      return
    }

    const socketInstance = io(socketUrl, {
      auth: {
        userId: session.user.id,
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    })

    socketInstance.on("connect", () => {
      console.log("Socket connected")
      setIsConnected(true)
    })

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
      setIsConnected(false)
    })

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      setIsConnected(false)
    })

    socketInstance.on("reconnect_attempt", (attemptNumber) => {
      console.log(`Socket reconnection attempt ${attemptNumber}`)
    })

    socketInstance.on("reconnect_failed", () => {
      console.error("Socket reconnection failed")
      setIsConnected(false)
    })

    // Handle various message events
    socketInstance.on("message_received", (data) => {
      console.log("New message received:", data.messageId)
    })

    socketInstance.on("typing_started", (data) => {
      console.log("Typing started:", data.senderId)
    })

    socketInstance.on("typing_stopped", (data) => {
      console.log("Typing stopped:", data.senderId)
    })

    socketInstance.on("message_status_updated", (data) => {
      console.log("Message status updated:", data.messageId, data.status)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [session?.user?.id])

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}

export const useSocket = () => useContext(SocketContext)
