"use client"

import type React from "react"

import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export function GroupEmpty() {
  const router = useRouter()
  const { toast } = useToast()
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false)
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
  })
  const [isCreating, setIsCreating] = useState(false)

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
      // In a real app, you would create the group via your API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const groupId = `group-${Date.now()}`

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
      router.push(`/dashboard/groups/${groupId}`)
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

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-primary/10 p-6">
        <Users className="h-10 w-10 text-primary" />
      </div>
      <h2 className="mt-4 text-2xl font-bold">No group selected</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Select a group from the sidebar or create a new one to get started
      </p>

      <Dialog open={isNewGroupOpen} onOpenChange={setIsNewGroupOpen}>
        <DialogTrigger asChild>
          <Button className="mt-6">Create a Group</Button>
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
  )
}
