"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { ChatMessage } from "@/components/chat/chat-message"
import { ChatInput } from "@/components/chat/chat-input"
import { useSocket } from "@/components/socket-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usersApi } from "@/lib/api/users-api"
import { messagesApi } from "@/lib/api/messages-api"

interface ChatViewProps {
  chatId: string
}

export function ChatView({ chatId }: ChatViewProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { socket } = useSocket()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recipient, setRecipient] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [replyingTo, setReplyingTo] = useState<any>(null)

  useEffect(() => {
    if (session?.user?.id && chatId) {
      fetchChat()
    }
  }, [session, chatId])

  useEffect(() => {
    if (socket) {
      socket.on("message_received", handleNewMessage)
      socket.on("typing_started", handleTypingStarted)
      socket.on("typing_stopped", handleTypingStopped)
      socket.on("message_deleted", handleMessageDeleted)
      socket.on("message_reaction", handleMessageReaction)

      return () => {
        socket.off("message_received", handleNewMessage)
        socket.off("typing_started", handleTypingStarted)
        socket.off("typing_stopped", handleTypingStopped)
        socket.off("message_deleted", handleMessageDeleted)
        socket.off("message_reaction", handleMessageReaction)
      }
    }
  }, [socket])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Replace mock data with API calls in the fetchChat function
  const fetchChat = async () => {
    setIsLoading(true)
    try {
      if (!session?.user?.id) {
        throw new Error("User not authenticated")
      }

      // Get recipient details
      const userResponse = await usersApi.search(chatId)
      if (!userResponse.data || !userResponse.data.data) {
        throw new Error("User not found")
      }

      const recipientData = userResponse.data.data

      // Get chat messages
      const messagesResponse = await messagesApi.getChat(session.user.id, chatId)
      if (!messagesResponse.data || !messagesResponse.data.data) {
        // No error thrown if no messages, just return empty array
        setMessages([])
      } else {
        // Transform messages to match our component's expected format
        const messagesData = messagesResponse.data.data.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.senderId,
          senderName: msg.senderId === session.user.id ? session.user.name || "You" : recipientData.name,
          senderImage: msg.senderId === session.user.id ? session.user.image : recipientData.image,
          timestamp: new Date(msg.timestamp),
          status: msg.status,
          type: msg.type,
          codeLanguage: msg.codeLanguage,
          codeFilename: msg.codeFilename,
          mediaUrl: msg.mediaId ? `/api/media/${msg.mediaId}` : undefined,
          replyTo: msg.replyToId
            ? {
                id: msg.replyToId,
                content: msg.replyToContent,
                senderName: msg.replyToSenderName,
              }
            : undefined,
        }))

        setMessages(messagesData)
      }

      setRecipient({
        id: recipientData.id,
        name: recipientData.name,
        image: recipientData.image || "/placeholder.svg?height=40&width=40",
        status: recipientData.status,
        lastSeen: new Date(recipientData.lastSeen),
      })
    } catch (error) {
      console.error("Error fetching chat:", error)
      toast({
        variant: "destructive",
        title: "Failed to load chat",
        description: "Please try again later",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewMessage = (message: any) => {
    if (message.senderId === chatId || message.recipientId === chatId) {
      setMessages((prev) => [...prev, message])
    }
  }

  const handleTypingStarted = (data: any) => {
    if (data.senderId === chatId) {
      setIsTyping(true)
    }
  }

  const handleTypingStopped = (data: any) => {
    if (data.senderId === chatId) {
      setIsTyping(false)
    }
  }

  const handleMessageDeleted = (data: any) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId))
  }

  const handleMessageReaction = (data: any) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === data.messageId) {
          return {
            ...msg,
            reactions: [...(msg.reactions || []), data.reaction],
          }
        }
        return msg
      }),
    )
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Update handleSendMessage to use the API
  const handleSendMessage = async (message: any) => {
    if (!session?.user?.id || !recipient) return

    const newMessage = {
      id: `temp-${Date.now()}`, // Temporary ID until we get the real one from the API
      content: message.content,
      senderId: session.user.id,
      senderName: session.user.name || "You",
      senderImage: session.user.image,
      timestamp: new Date(),
      status: "sent",
      type: message.type,
      codeLanguage: message.codeLanguage,
      codeFilename: message.codeFilename,
      mediaUrl: message.mediaId ? `/api/media/${message.mediaId}` : undefined,
      selfDestruct: message.selfDestruct,
      selfDestructTime: message.selfDestructTime,
      replyTo: replyingTo,
    }

    // Add message to local state immediately for UI responsiveness
    setMessages((prev) => [...prev, newMessage])

    // Clear reply state if replying
    if (replyingTo) {
      setReplyingTo(null)
    }

    try {
      // Send message via API
      const response = await messagesApi.send({
        recipientId: recipient.id,
        content: message.content,
        type: message.type,
        mediaId: message.mediaId,
        codeLanguage: message.codeLanguage,
        codeFilename: message.codeFilename,
        selfDestruct: message.selfDestruct,
        selfDestructTime: message.selfDestructTime,
        replyToId: replyingTo?.id,
      })

      if (!response.data || !response.data.data) {
        throw new Error("Failed to send message")
      }

      // Update the temporary message with the real one from the API
      const realMessageId = response.data.data.messageId
      setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, id: realMessageId } : msg)))

      // Emit socket event for real-time updates
      if (socket) {
        socket.emit("send_message", {
          messageId: realMessageId,
          recipientId: recipient.id,
          content: message.content,
          type: message.type,
          mediaId: message.mediaId,
          codeLanguage: message.codeLanguage,
          codeFilename: message.codeFilename,
          selfDestruct: message.selfDestruct,
          selfDestructTime: message.selfDestructTime,
          replyToId: replyingTo?.id,
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)

      // Update message status to failed
      setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "failed" } : msg)))

      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "Please try again",
      })
    }
  }

  const handleReplyMessage = (messageId: string) => {
    const message = messages.find((msg) => msg.id === messageId)
    if (message) {
      setReplyingTo({
        id: message.id,
        content: message.content,
        senderName: message.senderName,
      })
    }
  }

  // Update handleDeleteMessage to use the API
  const handleDeleteMessage = async (messageId: string) => {
    try {
      // Delete message via API
      await messagesApi.delete({ messageId })

      // Update local state
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId))

      // Emit socket event for real-time updates
      if (socket) {
        socket.emit("delete_message", { messageId })
      }

      toast({
        title: "Message deleted",
        description: "Your message has been deleted",
      })
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        variant: "destructive",
        title: "Failed to delete message",
        description: "Please try again",
      })
    }
  }

  // Update handleReactToMessage to use the API
  const handleReactToMessage = async (messageId: string, emoji: string) => {
    try {
      // Add reaction via API
      await messagesApi.react({ messageId, emoji })

      // Update local state
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            return {
              ...msg,
              reactions: [...(msg.reactions || []), { emoji, userId: session?.user?.id }],
            }
          }
          return msg
        }),
      )

      // Emit socket event for real-time updates
      if (socket) {
        socket.emit("react_to_message", { messageId, emoji })
      }
    } catch (error) {
      console.error("Error reacting to message:", error)
      toast({
        variant: "destructive",
        title: "Failed to add reaction",
        description: "Please try again",
      })
    }
  }

  const handleExportChat = async () => {
    try {
      const response = await fetch(`/api/export?chatId=${chatId}&format=markdown`)

      if (!response.ok) {
        throw new Error("Failed to export chat")
      }

      // Create a download link
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `chat-export-${new Date().toISOString().split("T")[0]}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Chat exported",
        description: "Your chat has been exported successfully",
      })
    } catch (error) {
      console.error("Error exporting chat:", error)
      toast({
        variant: "destructive",
        title: "Failed to export chat",
        description: "Please try again later",
      })
    }
  }

  // Update handleBlockUser to use the API
  const handleBlockUser = async () => {
    if (confirm("Are you sure you want to block this user?")) {
      try {
        // Block user via API
        await usersApi.block({ userId: chatId })

        toast({
          title: "User blocked",
          description: "You have blocked this user",
        })

        router.push("/dashboard/chats")
      } catch (error) {
        console.error("Error blocking user:", error)
        toast({
          variant: "destructive",
          title: "Failed to block user",
          description: "Please try again later",
        })
      }
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Chat header */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {isLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={recipient?.image} alt={recipient?.name} />
                <AvatarFallback>
                  {recipient?.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{recipient?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {isTyping
                    ? "Typing..."
                    : recipient?.status === "online"
                      ? "Online"
                      : `Last seen ${new Date(recipient?.lastSeen).toLocaleTimeString()}`}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportChat}>Export Chat</DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>Print Chat</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleBlockUser} className="text-destructive">
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={`flex gap-3 ${index % 2 === 0 ? "flex-row-reverse" : "flex-row"}`}>
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className={`h-20 w-2/3 rounded-lg ${index % 2 === 0 ? "ml-auto" : "mr-auto"}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isCurrentUser={message.senderId === session?.user?.id}
              onReply={handleReplyMessage}
              onDelete={handleDeleteMessage}
              onReact={handleReactToMessage}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <ChatInput
        recipientId={chatId}
        onSendMessage={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  )
}
