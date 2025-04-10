"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { Search, Plus, Check, CheckCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { analyticsApi } from "@/lib/api-client"
import { usersApi } from "@/lib/api-client"

interface Chat {
  id: string
  name: string
  image?: string
  lastMessage: {
    content: string
    timestamp: Date
    status: "sent" | "delivered" | "read"
    senderId: string
  }
  unreadCount: number
  online: boolean
}

export function ChatList() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [chats, setChats] = useState<Chat[]>([])
  const [filteredChats, setFilteredChats] = useState<Chat[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [newChatEmail, setNewChatEmail] = useState("")
  const [isSearchingUser, setIsSearchingUser] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchChats()
    }
  }, [session])

  useEffect(() => {
    if (searchQuery) {
      setFilteredChats(chats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase())))
    } else {
      setFilteredChats(chats)
    }
  }, [searchQuery, chats])

  // Replace mock data with API calls in the fetchChats function
  const fetchChats = async () => {
    setIsLoading(true)
    try {
      if (!session?.user?.id) {
        throw new Error("User not authenticated")
      }

      // Get active chats from API
      const response = await analyticsApi.getActiveChats(session.user.id)

      if (!response.data || !response.data.data) {
        throw new Error("Invalid response from API")
      }

      // Transform API response to match our component's expected format
      const chatsData = response.data.data.map((chat: any) => ({
        id: chat.userId,
        name: chat.userName,
        image: chat.userImage || `/placeholder.svg?height=40&width=40`,
        lastMessage: {
          content: chat.lastMessage.content,
          timestamp: new Date(chat.lastMessage.timestamp),
          status: chat.lastMessage.status,
          senderId: chat.lastMessage.senderId,
        },
        unreadCount: chat.unreadCount,
        online: chat.online,
      }))

      setChats(chatsData)
      setFilteredChats(chatsData)
    } catch (error) {
      console.error("Error fetching chats:", error)
      toast({
        variant: "destructive",
        title: "Failed to load chats",
        description: "Please try again later",
      })
      // Fallback to empty array if API fails
      setChats([])
      setFilteredChats([])
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockChats = (): Chat[] => {
    const names = [
      "Jane Smith",
      "John Doe",
      "Alice Johnson",
      "Bob Williams",
      "Carol Davis",
      "Dave Wilson",
      "Eve Brown",
      "Frank Miller",
    ]

    const messages = [
      "Hey, how's it going?",
      "Can you help me with this bug?",
      "Did you see the new API docs?",
      "Meeting at 3pm today",
      "I pushed the changes to GitHub",
      "The tests are failing on CI",
      "Let's pair program tomorrow",
      "Check out this new library I found",
    ]

    return names.map((name, index) => {
      const now = new Date()
      const timestamp = new Date(now)
      timestamp.setHours(now.getHours() - Math.floor(Math.random() * 24))

      return {
        id: `user-${index + 1}`,
        name,
        image: `/placeholder.svg?height=40&width=40`,
        lastMessage: {
          content: messages[index],
          timestamp,
          status: ["sent", "delivered", "read"][Math.floor(Math.random() * 3)] as "sent" | "delivered" | "read",
          senderId: Math.random() > 0.5 ? `user-${index + 1}` : session?.user?.id || "",
        },
        unreadCount: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0,
        online: Math.random() > 0.5,
      }
    })
  }

  const handleChatClick = (chatId: string) => {
    router.push(`/dashboard/chats/${chatId}`)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Replace mock data with API calls in the handleNewChat function
  const handleNewChat = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newChatEmail) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter an email address",
      })
      return
    }

    setIsSearchingUser(true)

    try {
      // Search for user by email
      const response = await usersApi.search(newChatEmail)

      if (!response.data || !response.data.data) {
        throw new Error("User not found")
      }

      const foundUser = response.data.data

      // Add to chat list
      const newChat: Chat = {
        id: foundUser.id,
        name: foundUser.name,
        image: foundUser.image || `/placeholder.svg?height=40&width=40`,
        lastMessage: {
          content: "Start a conversation",
          timestamp: new Date(),
          status: "sent",
          senderId: session?.user?.id || "",
        },
        unreadCount: 0,
        online: false,
      }

      setChats((prev) => [newChat, ...prev])
      setIsNewChatOpen(false)
      setNewChatEmail("")

      // Navigate to the new chat
      router.push(`/dashboard/chats/${foundUser.id}`)
    } catch (error) {
      console.error("Error creating new chat:", error)
      toast({
        variant: "destructive",
        title: "User not found",
        description: "We couldn't find a user with that email",
      })
    } finally {
      setIsSearchingUser(false)
    }
  }

  const getStatusIcon = (status: string, senderId: string) => {
    if (senderId === session?.user?.id) {
      if (status === "read") {
        return <CheckCheck className="h-3 w-3" />
      } else if (status === "delivered") {
        return <Check className="h-3 w-3" />
      } else {
        return <Check className="h-3 w-3 opacity-50" />
      }
    }
    return null
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search chats..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
            <DialogTrigger asChild>
              <Button size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Chat</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleNewChat} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={newChatEmail}
                    onChange={(e) => setNewChatEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSearchingUser}>
                  {isSearchingUser ? "Searching..." : "Start Chat"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg p-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-center text-muted-foreground">
              {searchQuery ? "No chats found" : "No chats yet. Start a new conversation!"}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5 p-2">
            {filteredChats.map((chat) => {
              const isActive = pathname === `/dashboard/chats/${chat.id}`

              return (
                <button
                  key={chat.id}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg p-2 text-left",
                    isActive ? "bg-muted" : "hover:bg-muted/50",
                  )}
                  onClick={() => handleChatClick(chat.id)}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={chat.image} alt={chat.name} />
                      <AvatarFallback>
                        {chat.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                    )}
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{chat.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(chat.lastMessage.timestamp), "HH:mm")}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm text-muted-foreground">
                        {chat.lastMessage.senderId === session?.user?.id && "You: "}
                        {chat.lastMessage.content}
                      </p>

                      <div className="flex items-center gap-1">
                        {getStatusIcon(chat.lastMessage.status, chat.lastMessage.senderId)}

                        {chat.unreadCount > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
