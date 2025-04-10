"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { Search, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { groupsApi } from "@/lib/api-client"

interface Group {
  id: string
  name: string
  description: string
  image?: string
  memberCount: number
  lastMessage: {
    content: string
    timestamp: Date
    senderId: string
    senderName: string
  }
  unreadCount: number
}

export function GroupList() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [groups, setGroups] = useState<Group[]>([])
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false)
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
  })
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchGroups()
    }
  }, [session])

  useEffect(() => {
    if (searchQuery) {
      setFilteredGroups(
        groups.filter(
          (group) =>
            group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.description.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    } else {
      setFilteredGroups(groups)
    }
  }, [searchQuery, groups])

  const fetchGroups = async () => {
    setIsLoading(true)
    try {
      if (!session?.user?.id) {
        throw new Error("User not authenticated")
      }

      // Get user's groups from API
      const response = await groupsApi.getUserGroups(session.user.id)

      if (!response.data || !response.data.data) {
        throw new Error("Invalid response from API")
      }

      // Transform API response to match our component's expected format
      const groupsData = response.data.data.map((group: any) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        image: group.image || "/placeholder.svg?height=80&width=80",
        memberCount: group.memberCount,
        lastMessage: {
          content: group.lastMessage.content,
          timestamp: new Date(group.lastMessage.timestamp),
          senderId: group.lastMessage.senderId,
          senderName: group.lastMessage.senderName,
        },
        unreadCount: group.unreadCount,
      }))

      setGroups(groupsData)
      setFilteredGroups(groupsData)
    } catch (error) {
      console.error("Error fetching groups:", error)
      toast({
        variant: "destructive",
        title: "Failed to load groups",
        description: "Please try again later",
      })
      // Fallback to empty array if API fails
      setGroups([])
      setFilteredGroups([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newGroup.name.trim()) {
      toast({
        variant: "destructive",
        title: "Group name required",
        description: "Please enter a name for your group",
      })
      return
    }

    setIsCreating(true)

    try {
      // Create group via API
      const response = await groupsApi.create({
        name: newGroup.name,
        description: newGroup.description,
        members: [], // Initially empty, members can be added later
      })

      if (!response.data || !response.data.data) {
        throw new Error("Failed to create group")
      }

      const createdGroup = {
        id: response.data.data.groupId,
        name: newGroup.name,
        description: newGroup.description,
        image: "/placeholder.svg?height=80&width=80", // Default image
        memberCount: 1, // Just the creator initially
        lastMessage: {
          content: "Group created",
          timestamp: new Date(),
          senderId: session?.user?.id || "",
          senderName: "System",
        },
        unreadCount: 0,
      }

      setGroups((prev) => [createdGroup, ...prev])
      setIsNewGroupOpen(false)
      setNewGroup({
        name: "",
        description: "",
      })

      toast({
        title: "Group created",
        description: "Your group has been created successfully",
      })

      // Navigate to the new group
      router.push(`/dashboard/groups/${createdGroup.id}`)
    } catch (error) {
      console.error("Error creating group:", error)
      toast({
        variant: "destructive",
        title: "Failed to create group",
        description: "Please try again later",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleGroupClick = (groupId: string) => {
    router.push(`/dashboard/groups/${groupId}`)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search groups..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <Dialog open={isNewGroupOpen} onOpenChange={setIsNewGroupOpen}>
            <DialogTrigger asChild>
              <Button size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Group</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Project Team"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this group about?"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Group"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="space-y-4 p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg border p-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-center text-muted-foreground">
              {searchQuery ? "No groups found" : "No groups yet. Create your first group!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {filteredGroups.map((group) => {
              const isActive = pathname === `/dashboard/groups/${group.id}`

              return (
                <button
                  key={group.id}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border p-4 text-left",
                    isActive ? "bg-muted" : "hover:bg-muted/50",
                  )}
                  onClick={() => handleGroupClick(group.id)}
                >
                  <Avatar>
                    <AvatarImage src={group.image} alt={group.name} />
                    <AvatarFallback>
                      {group.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{group.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(group.lastMessage.timestamp), "HH:mm")}
                      </p>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                      {group.lastMessage.senderId === session?.user?.id ? "You: " : `${group.lastMessage.senderName}: `}
                      {group.lastMessage.content}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
                      </p>

                      {group.unreadCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground">
                          {group.unreadCount}
                        </span>
                      )}
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
