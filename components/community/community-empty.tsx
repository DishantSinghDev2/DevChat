"use client"

import type React from "react"

import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export function CommunityEmpty() {
  const router = useRouter()
  const { toast } = useToast()
  const [isNewCommunityOpen, setIsNewCommunityOpen] = useState(false)
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    isPrivate: false,
  })
  const [isCreating, setIsCreating] = useState(false)

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
      // In a real app, you would create the community via your API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const communityId = `community-${Date.now()}`

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
      router.push(`/dashboard/communities/${communityId}`)
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
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-primary/10 p-6">
        <Globe className="h-10 w-10 text-primary" />
      </div>
      <h2 className="mt-4 text-2xl font-bold">No community selected</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Select a community from the sidebar or create a new one to get started
      </p>

      <Dialog open={isNewCommunityOpen} onOpenChange={setIsNewCommunityOpen}>
        <DialogTrigger asChild>
          <Button className="mt-6">Create a Community</Button>
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
  )
}
