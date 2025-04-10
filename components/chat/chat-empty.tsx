"use client"

import type React from "react"

import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export function ChatEmpty() {
  const router = useRouter()
  const { toast } = useToast()
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [newChatEmail, setNewChatEmail] = useState("")
  const [isSearchingUser, setIsSearchingUser] = useState(false)

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
      // In a real app, you would search for the user by email
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate finding a user
      const foundUser = {
        id: `user-${Math.floor(Math.random() * 1000)}`,
        name: `User ${Math.floor(Math.random() * 100)}`,
        email: newChatEmail,
      }

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

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-primary/10 p-6">
        <MessageSquare className="h-10 w-10 text-primary" />
      </div>
      <h2 className="mt-4 text-2xl font-bold">No chat selected</h2>
      <p className="mt-2 max-w-md text-muted-foreground">Select a chat from the sidebar or start a new conversation</p>

      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogTrigger asChild>
          <Button className="mt-6">Start a New Chat</Button>
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
  )
}
