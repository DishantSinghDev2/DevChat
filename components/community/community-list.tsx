"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Search, Plus, Globe, Lock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { communitiesApi } from "@/lib/api-client"

interface Community {
  id: string
  name: string
  description: string
  image?: string
  memberCount: number
  isPrivate: boolean
}

export function CommunityList() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [communities, setCommunities] = useState<Community[]>([])
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewCommunityOpen, setIsNewCommunityOpen] = useState(false)
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    isPrivate: false,
  })
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchCommunities()
    }
  }, [session])

  useEffect(() => {
    if (searchQuery) {
      setFilteredCommunities(
        communities.filter(
          (community) =>
            community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            community.description.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    } else {
      setFilteredCommunities(communities)
    }
  }, [searchQuery, communities])

  // Replace mock data with API calls in the fetchCommunities function
  const fetchCommunities = async () => {
    setIsLoading(true)
    try {
      if (!session?.user?.id) {
        throw new Error("User not authenticated")
      }

      // Get user's communities from API
      const response = await communitiesApi.getUserCommunities(session.user.id)

      if (!response.data || !response.data.data) {
        throw new Error("Invalid response from API")
      }

      // Transform API response to match our component's expected format
      const communitiesData = response.data.data.map((community: any) => ({
        id: community.id,
        name: community.name,
        description: community.description,
        image: community.image || "/placeholder.svg?height=80&width=80",
        memberCount: community.memberCount,
        isPrivate: community.isPrivate,
      }))

      setCommunities(communitiesData)
      setFilteredCommunities(communitiesData)
    } catch (error) {
      console.error("Error fetching communities:", error)
      toast({
        variant: "destructive",
        title: "Failed to load communities",
        description: "Please try again later",
      })
      // Fallback to empty array if API fails
      setCommunities([])
      setFilteredCommunities([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommunityClick = (communityId: string) => {
    router.push(`/dashboard/communities/${communityId}`)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Replace mock data with API calls in the handleCreateCommunity function
  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newCommunity.name.trim()) {
      toast({
        variant: "destructive",
        title: "Community name required",
        description: "Please enter a name for your community",
      })
      return
    }

    setIsCreating(true)

    try {
      // Create community via API
      const response = await communitiesApi.create({
        name: newCommunity.name,
        description: newCommunity.description,
        isPrivate: newCommunity.isPrivate,
      })

      if (!response.data || !response.data.data) {
        throw new Error("Failed to create community")
      }

      const createdCommunity = {
        id: response.data.data.communityId,
        name: newCommunity.name,
        description: newCommunity.description,
        image: "/placeholder.svg?height=80&width=80", // Default image
        memberCount: 1, // Just the creator initially
        isPrivate: newCommunity.isPrivate,
      }

      setCommunities((prev) => [createdCommunity, ...prev])
      setIsNewCommunityOpen(false)
      setNewCommunity({
        name: "",
        description: "",
        isPrivate: false,
      })

      toast({
        title: "Community created",
        description: "Your community has been created successfully",
      })

      // Navigate to the new community
      router.push(`/dashboard/communities/${createdCommunity.id}`)
    } catch (error) {
      console.error("Error creating community:", error)
      toast({
        variant: "destructive",
        title: "Failed to create community",
        description: "Please try again later",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search communities..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <Dialog open={isNewCommunityOpen} onOpenChange={setIsNewCommunityOpen}>
            <DialogTrigger asChild>
              <Button size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Community</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCommunity} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Community Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. JavaScript Developers"
                    value={newCommunity.name}
                    onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this community about?"
                    value={newCommunity.description}
                    onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="private">Private Community</Label>
                    <p className="text-xs text-muted-foreground">Only invited members can join</p>
                  </div>
                  <Switch
                    id="private"
                    checked={newCommunity.isPrivate}
                    onCheckedChange={(checked) => setNewCommunity({ ...newCommunity, isPrivate: checked })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Community"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="space-y-4 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg border p-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-center text-muted-foreground">
              {searchQuery ? "No communities found" : "No communities yet. Create your first community!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {filteredCommunities.map((community) => {
              const isActive = pathname === `/dashboard/communities/${community.id}`

              return (
                <button
                  key={community.id}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border p-4 text-left",
                    isActive ? "bg-muted" : "hover:bg-muted/50",
                  )}
                  onClick={() => handleCommunityClick(community.id)}
                >
                  <Avatar className="h-16 w-16 rounded-lg">
                    <AvatarImage src={community.image} alt={community.name} />
                    <AvatarFallback className="rounded-lg">
                      {community.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{community.name}</h3>
                      {community.isPrivate ? (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{community.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {community.memberCount} {community.memberCount === 1 ? "member" : "members"}
                    </p>
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
