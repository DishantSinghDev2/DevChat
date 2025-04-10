"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MoreVertical, Phone, Video, UserPlus, Settings } from "lucide-react"
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { groupsApi } from "@/lib/api/groups-api"
import { groupMessagesApi } from "@/lib/api/group-messages-api"

interface GroupViewProps {
  groupId: string
}

export function GroupView({ groupId }: GroupViewProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { socket } = useSocket()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [group, setGroup] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [replyingTo, setReplyingTo] = useState<any>(null)

  useEffect(() => {
    if (session?.user?.id && groupId) {
      fetchGroup()
    }
  }, [session, groupId])

  useEffect(() => {
    if (socket) {
      socket.on("group_message_received", handleNewMessage)
      socket.on("member_joined", handleMemberJoined)
      socket.on("member_left", handleMemberLeft)
      socket.on("group_message_deleted", handleMessageDeleted)

      return () => {
        socket.off("group_message_received", handleNewMessage)
        socket.off("member_joined", handleMemberJoined)
        socket.off("member_left", handleMemberLeft)
        socket.off("group_message_deleted", handleMessageDeleted)
      }
    }
  }, [socket])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Replace mock data with API calls in the fetchGroup function
  const fetchGroup = async () => {
    setIsLoading(true)
    try {
      if (!session?.user?.id) {
        throw new Error("User not authenticated")
      }

      // Get group details
      const groupResponse = await groupsApi.getDetails(groupId)
      if (!groupResponse.data || !groupResponse.data.data) {
        throw new Error("Group not found")
      }

      const groupData = groupResponse.data.data

      // Get group messages
      const messagesResponse = await groupMessagesApi.getMessages(groupId)
      if (!messagesResponse.data || !messagesResponse.data.data) {
        throw new Error("Failed to load messages")
      }

      // Transform messages to match our component's expected format
      const messagesData = messagesResponse.data.data.map((msg: any) => {
        // Handle system messages
        if (msg.type === "system") {
          return {
            id: msg.id,
            content: msg.content,
            senderId: "system",
            senderName: "System",
            timestamp: new Date(msg.timestamp),
            status: "read",
            type: "system",
          }
        }

        // Regular messages
        return {
          id: msg.id,
          content: msg.content,
          senderId: msg.senderId,
          senderName: msg.senderName,
          senderImage: msg.senderImage || `/placeholder.svg?height=40&width=40`,
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
        }
      })

      setGroup({
        id: groupData.id,
        name: groupData.name,
        description: groupData.description,
        image: groupData.image || "/placeholder.svg?height=80&width=80",
        createdAt: new Date(groupData.createdAt),
        createdBy: groupData.createdById,
      })

      setMembers(
        groupData.members.map((member: any) => ({
          id: member.userId,
          name: member.userName,
          image: member.userImage || `/placeholder.svg?height=40&width=40`,
          role: member.role,
          joinedAt: new Date(member.joinedAt),
          online: member.online,
        })),
      )

      setMessages(messagesData)
    } catch (error) {
      console.error("Error fetching group:", error)
      toast({
        variant: "destructive",
        title: "Failed to load group",
        description: "Please try again later",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewMessage = (message: any) => {
    if (message.groupId === groupId) {
      setMessages((prev) => [...prev, message])
    }
  }

  const handleMemberJoined = (data: any) => {
    if (data.groupId === groupId) {
      setMembers((prev) => [...prev, data.member])

      // Add system message
      setMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          content: `${data.member.name} joined the group`,
          senderId: "system",
          senderName: "System",
          timestamp: new Date(),
          status: "read",
          type: "system",
        },
      ])
    }
  }

  const handleMemberLeft = (data: any) => {
    if (data.groupId === groupId) {
      setMembers((prev) => prev.filter((member) => member.id !== data.memberId))

      // Add system message
      const memberName = members.find((m) => m.id === data.memberId)?.name || "Someone"
      setMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          content: `${memberName} left the group`,
          senderId: "system",
          senderName: "System",
          timestamp: new Date(),
          status: "read",
          type: "system",
        },
      ])
    }
  }

  const handleMessageDeleted = (data: any) => {
    if (data.groupId === groupId) {
      setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId))
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Update handleSendMessage to use the API
  const handleSendMessage = async (message: any) => {
    if (!session?.user?.id || !group) return

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
      const response = await groupMessagesApi.send({
        groupId: group.id,
        content: message.content,
        type: message.type,
        mediaId: message.mediaId,
        codeLanguage: message.codeLanguage,
        codeFilename: message.codeFilename,
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
        socket.emit("send_group_message", {
          messageId: realMessageId,
          groupId: group.id,
          content: message.content,
          type: message.type,
          mediaId: message.mediaId,
          codeLanguage: message.codeLanguage,
          codeFilename: message.codeFilename,
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
      await groupMessagesApi.delete({ groupId: group.id, messageId })

      // Update local state
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId))

      // Emit socket event for real-time updates
      if (socket) {
        socket.emit("delete_group_message", { groupId: group.id, messageId })
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
      await groupMessagesApi.react({ groupId: group.id, messageId, emoji })

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
        socket.emit("react_to_group_message", { groupId: group.id, messageId, emoji })
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

  // Update handleLeaveGroup to use the API
  const handleLeaveGroup = async () => {
    if (confirm("Are you sure you want to leave this group?")) {
      try {
        // Leave group via API
        await groupsApi.removeMembers({
          groupId: group.id,
          memberId: session?.user?.id,
        })

        toast({
          title: "Left group",
          description: "You have left the group",
        })

        router.push("/dashboard/groups")
      } catch (error) {
        console.error("Error leaving group:", error)
        toast({
          variant: "destructive",
          title: "Failed to leave group",
          description: "Please try again later",
        })
      }
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Group header */}
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
                <AvatarImage src={group?.image} alt={group?.name} />
                <AvatarFallback>
                  {group?.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{group?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {members.length} {members.length === 1 ? "member" : "members"}
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

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserPlus className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Group Members</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Members ({members.length})</h3>
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.image} alt={member.name} />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                        {member.online && <span className="h-2.5 w-2.5 rounded-full bg-green-500" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Add Members</h3>
                  <Button className="w-full">Invite People</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Group Settings
              </DropdownMenuItem>
              <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
              <DropdownMenuItem>Search Messages</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLeaveGroup} className="text-destructive">
                Leave Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Group messages */}
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
          messages.map((message) => {
            if (message.type === "system") {
              return (
                <div key={message.id} className="my-2 text-center">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    {message.content}
                  </span>
                </div>
              )
            }

            return (
              <ChatMessage
                key={message.id}
                message={message}
                isCurrentUser={message.senderId === session?.user?.id}
                onReply={handleReplyMessage}
                onDelete={handleDeleteMessage}
                onReact={handleReactToMessage}
              />
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Group input */}
      <ChatInput
        recipientId={groupId}
        onSendMessage={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  )
}
