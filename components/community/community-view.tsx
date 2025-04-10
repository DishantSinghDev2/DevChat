"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MoreVertical, Hash, Users, Settings, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/chat/chat-message"
import { ChatInput } from "@/components/chat/chat-input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { communitiesApi } from "@/lib/api-client"
import { channelMessagesApi } from "@/lib/api-client"
import { socket } from "@/lib/socket"

interface CommunityViewProps {
  communityId: string
}

export function CommunityView({ communityId }: CommunityViewProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [community, setCommunity] = useState<any>(null)
  const [channels, setChannels] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [activeChannel, setActiveChannel] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [isNewChannelOpen, setIsNewChannelOpen] = useState(false)
  const [newChannelName, setNewChannelName] = useState("")
  const [newChannelDescription, setNewChannelDescription] = useState("")
  const [isCreatingChannel, setIsCreatingChannel] = useState(false)

  useEffect(() => {
    if (session?.user?.id && communityId) {
      fetchCommunity()
    }
  }, [session, communityId])

  useEffect(() => {
    if (activeChannel) {
      fetchChannelMessages(activeChannel)
    }
  }, [activeChannel])

  // Replace mock data with API calls in the fetchCommunity function
  const fetchCommunity = async () => {
    setIsLoading(true)
    try {
      if (!session?.user?.id) {
        throw new Error("User not authenticated")
      }

      // Get community details
      const communityResponse = await communitiesApi.getDetails(communityId)
      if (!communityResponse.data || !communityResponse.data.data) {
        throw new Error("Community not found")
      }

      const communityData = communityResponse.data.data

      // Get community channels
      const channelsResponse = await communitiesApi.getChannels(communityId)
      if (!channelsResponse.data || !channelsResponse.data.data) {
        throw new Error("Failed to load channels")
      }

      // Transform channels to match our component's expected format
      const channelsData = channelsResponse.data.data.map((channel: any) => ({
        id: channel.id,
        name: channel.name,
        description: channel.description,
        isPrivate: channel.isPrivate,
      }))

      setCommunity({
        id: communityData.id,
        name: communityData.name,
        description: communityData.description,
        image: communityData.image || "/placeholder.svg?height=80&width=80",
        coverImage: communityData.coverImage || "/placeholder.svg?height=200&width=800",
        memberCount: communityData.memberCount,
        isPrivate: communityData.isPrivate,
        createdAt: new Date(communityData.createdAt),
      })

      setChannels(channelsData)
      setMembers(
        communityData.members.map((member: any) => ({
          id: member.userId,
          name: member.userName,
          image: member.userImage || `/placeholder.svg?height=40&width=40`,
          role: member.role,
          joinedAt: new Date(member.joinedAt),
        })),
      )

      // Set active channel to the first one if available
      if (channelsData.length > 0) {
        setActiveChannel(channelsData[0].id)
      }
    } catch (error) {
      console.error("Error fetching community:", error)
      toast({
        variant: "destructive",
        title: "Failed to load community",
        description: "Please try again later",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Replace mock data with API calls in the fetchChannelMessages function
  const fetchChannelMessages = async (channelId: string) => {
    try {
      // Get channel messages
      const response = await channelMessagesApi.getMessages(channelId)
      if (!response.data || !response.data.data) {
        throw new Error("Failed to load messages")
      }

      // Transform messages to match our component's expected format
      const messagesData = response.data.data.map((msg: any) => ({
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
      }))

      setMessages(messagesData)
    } catch (error) {
      console.error("Error fetching channel messages:", error)
      toast({
        variant: "destructive",
        title: "Failed to load messages",
        description: "Please try again later",
      })
      // Fallback to empty array if API fails
      setMessages([])
    }
  }

  const generateMockMessages = (channelId: string) => {
    const now = new Date()
    const messages = []

    // Generate 10 mock messages
    for (let i = 0; i < 10; i++) {
      const senderId = `member-${Math.floor(Math.random() * 10) + 1}`
      const sender = members.find((m) => m.id === senderId) || members[0]
      const timestamp = new Date(now)
      timestamp.setMinutes(now.getMinutes() - (10 - i) * 15)

      messages.push({
        id: `msg-${channelId}-${i}`,
        content: `This is a message in the ${channels.find((c) => c.id === channelId)?.name} channel (${i + 1})`,
        senderId: sender.id,
        senderName: sender.name,
        senderImage: sender.image,
        timestamp,
        status: "read",
        type: "text",
      })
    }

    return messages
  }

  // Update handleSendMessage to use the API
  const handleSendMessage = async (message: any) => {
    if (!session?.user?.id || !activeChannel) return

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
    }

    // Add message to local state immediately for UI responsiveness
    setMessages((prev) => [...prev, newMessage])

    try {
      // Send message via API
      const response = await channelMessagesApi.send({
        channelId: activeChannel,
        content: message.content,
        type: message.type,
        mediaId: message.mediaId,
        codeLanguage: message.codeLanguage,
        codeFilename: message.codeFilename,
      })

      if (!response.data || !response.data.data) {
        throw new Error("Failed to send message")
      }

      // Update the temporary message with the real one from the API
      const realMessageId = response.data.data.messageId
      setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, id: realMessageId } : msg)))

      // Emit socket event for real-time updates
      if (socket) {
        socket.emit("send_channel_message", {
          messageId: realMessageId,
          channelId: activeChannel,
          content: message.content,
          type: message.type,
          mediaId: message.mediaId,
          codeLanguage: message.codeLanguage,
          codeFilename: message.codeFilename,
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

  // Update handleCreateChannel to use the API
  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newChannelName.trim()) {
      toast({
        variant: "destructive",
        title: "Channel name required",
        description: "Please enter a name for the channel",
      })
      return
    }

    setIsCreatingChannel(true)

    try {
      // Create channel via API
      const response = await communitiesApi.createChannel({
        communityId: communityId,
        name: newChannelName.toLowerCase().replace(/\s+/g, "-"),
        description: newChannelDescription,
        isPrivate: false,
      })

      if (!response.data || !response.data.data) {
        throw new Error("Failed to create channel")
      }

      const newChannel = {
        id: response.data.data.channelId,
        name: newChannelName.toLowerCase().replace(/\s+/g, "-"),
        description: newChannelDescription,
        isPrivate: false,
      }

      setChannels((prev) => [...prev, newChannel])
      setActiveChannel(newChannel.id)
      setIsNewChannelOpen(false)
      setNewChannelName("")
      setNewChannelDescription("")

      toast({
        title: "Channel created",
        description: `#${newChannel.name} has been created successfully`,
      })
    } catch (error) {
      console.error("Error creating channel:", error)
      toast({
        variant: "destructive",
        title: "Failed to create channel",
        description: "Please try again later",
      })
    } finally {
      setIsCreatingChannel(false)
    }
  }

  // Update handleLeaveCommunity to use the API
  const handleLeaveCommunity = async () => {
    if (confirm("Are you sure you want to leave this community?")) {
      try {
        // Leave community via API
        await communitiesApi.leave({
          communityId: communityId,
        })

        toast({
          title: "Left community",
          description: "You have left the community",
        })

        router.push("/dashboard/communities")
      } catch (error) {
        console.error("Error leaving community:", error)
        toast({
          variant: "destructive",
          title: "Failed to leave community",
          description: "Please try again later",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-40 items-end bg-muted p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
        </div>
        <div className="flex flex-1">
          <div className="w-60 border-r p-4">
            <Skeleton className="mb-4 h-8 w-full" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-full" />
              ))}
            </div>
          </div>
          <div className="flex-1 p-4">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Community header */}
      <div className="relative h-40 bg-cover bg-center" style={{ backgroundImage: `url(${community.coverImage})` }}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end gap-4">
            <Avatar className="h-20 w-20 rounded-lg border-4 border-background">
              <AvatarImage src={community.image} alt={community.name} />
              <AvatarFallback className="rounded-lg">{community.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="mb-1">
              <h1 className="text-2xl font-bold text-white">{community.name}</h1>
              <p className="text-white/80">{community.description}</p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4 text-white md:hidden"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4 text-white">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Community Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              Invite Members
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLeaveCommunity} className="text-destructive">
              Leave Community
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Community content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-60 overflow-y-auto border-r">
          <Tabs defaultValue="channels" className="p-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>

            <TabsContent value="channels" className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Channels</h3>
                <Dialog open={isNewChannelOpen} onOpenChange={setIsNewChannelOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Channel</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateChannel} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="channel-name">Channel Name</Label>
                        <Input
                          id="channel-name"
                          placeholder="e.g. announcements"
                          value={newChannelName}
                          onChange={(e) => setNewChannelName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="channel-description">Description (optional)</Label>
                        <Input
                          id="channel-description"
                          placeholder="What is this channel about?"
                          value={newChannelDescription}
                          onChange={(e) => setNewChannelDescription(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isCreatingChannel}>
                        {isCreatingChannel ? "Creating..." : "Create Channel"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {channels.map((channel) => (
                <button
                  key={channel.id}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                    activeChannel === channel.id ? "bg-muted font-medium" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setActiveChannel(channel.id)}
                >
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span>{channel.name}</span>
                  {channel.isPrivate && (
                    <span className="ml-auto rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-xs">Private</span>
                  )}
                </button>
              ))}
            </TabsContent>

            <TabsContent value="members" className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Members ({members.length})</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-2 rounded-md px-2 py-1.5">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{member.name}</span>
                  {member.role !== "member" && (
                    <span className="ml-auto rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-xs">
                      {member.role}
                    </span>
                  )}
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Channel content */}
        <div className="flex flex-1 flex-col">
          {activeChannel && (
            <>
              <div className="flex h-14 items-center justify-between border-b px-4">
                <div className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h2 className="font-medium">{channels.find((c) => c.id === activeChannel)?.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {channels.find((c) => c.id === activeChannel)?.description}
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Pin Message</DropdownMenuItem>
                    <DropdownMenuItem>Search Channel</DropdownMenuItem>
                    <DropdownMenuItem>Channel Settings</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center">
                    <Hash className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-xl font-medium">
                      Welcome to #{channels.find((c) => c.id === activeChannel)?.name}
                    </h3>
                    <p className="mt-2 text-center text-muted-foreground">
                      This is the start of the channel. Be the first to send a message!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isCurrentUser={message.senderId === session?.user?.id}
                      onReply={() => {}}
                      onDelete={() => {}}
                      onReact={() => {}}
                    />
                  ))
                )}
              </div>

              <ChatInput recipientId={activeChannel} onSendMessage={handleSendMessage} onCancelReply={() => {}} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
