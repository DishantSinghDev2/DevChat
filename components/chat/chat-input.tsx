"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Send, Paperclip, Code, Clock, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField } from "@/components/ui/form"
import { EmojiPicker } from "./emoji-picker"
import { useSocket } from "@/components/socket-provider"
import { AIAssistDialog } from "./ai-assist-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
  message: z.string().min(1),
})

interface ChatInputProps {
  recipientId: string
  onSendMessage: (message: {
    content: string
    type: string
    mediaId?: string
    codeLanguage?: string
    codeFilename?: string
    selfDestruct?: boolean
    selfDestructTime?: number
  }) => void
  replyingTo?: {
    id: string
    content: string
    senderName: string
  }
  onCancelReply: () => void
}

export function ChatInput({ recipientId, onSendMessage, replyingTo, onCancelReply }: ChatInputProps) {
  const [isTyping, setIsTyping] = useState(false)
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false)
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [isSelfDestructDialogOpen, setIsSelfDestructDialogOpen] = useState(false)
  const [codeLanguage, setCodeLanguage] = useState("javascript")
  const [codeFilename, setCodeFilename] = useState("")
  const [code, setCode] = useState("")
  const [selfDestructTime, setSelfDestructTime] = useState(30)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { socket } = useSocket()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  })

  const handleTyping = () => {
    if (!isTyping && socket) {
      setIsTyping(true)
      socket.emit("typing", { recipientId })

      // Clear typing indicator after 2 seconds of inactivity
      setTimeout(() => {
        setIsTyping(false)
        socket.emit("stop_typing", { recipientId })
      }, 2000)
    }
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSendMessage({
      content: values.message,
      type: "text",
    })
    form.reset()
  }

  const handleEmojiSelect = (emoji: string) => {
    const { message } = form.getValues()
    form.setValue("message", message + emoji)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Handle file upload logic here
    // For now, we'll just simulate it
    const reader = new FileReader()
    reader.onload = () => {
      const fileType = file.type.startsWith("image/") ? "image" : "file"
      onSendMessage({
        content: file.name,
        type: fileType,
        mediaId: "simulated-media-id",
      })
    }
    reader.readAsDataURL(file)
  }

  const handleCodeSubmit = () => {
    if (code.trim()) {
      onSendMessage({
        content: code,
        type: "code",
        codeLanguage,
        codeFilename: codeFilename || undefined,
      })
      setCode("")
      setCodeFilename("")
      setIsCodeDialogOpen(false)
    }
  }

  const handleSelfDestructMessage = () => {
    const { message } = form.getValues()
    if (message.trim()) {
      onSendMessage({
        content: message,
        type: "text",
        selfDestruct: true,
        selfDestructTime,
      })
      form.reset()
      setIsSelfDestructDialogOpen(false)
    }
  }

  return (
    <div className="border-t bg-background p-4">
      {replyingTo && (
        <div className="mb-2 flex items-center justify-between rounded-lg border bg-muted p-2">
          <div className="flex-1 truncate">
            <p className="text-xs font-medium">Replying to {replyingTo.senderName}</p>
            <p className="truncate text-xs text-muted-foreground">{replyingTo.content}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancelReply}>
            Cancel
          </Button>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center gap-1">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="h-5 w-5" />
              </Button>

              <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="ghost" size="icon">
                    <Code className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Share Code Snippet</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="language">Language</Label>
                        <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="typescript">TypeScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="csharp">C#</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                            <SelectItem value="go">Go</SelectItem>
                            <SelectItem value="rust">Rust</SelectItem>
                            <SelectItem value="php">PHP</SelectItem>
                            <SelectItem value="ruby">Ruby</SelectItem>
                            <SelectItem value="swift">Swift</SelectItem>
                            <SelectItem value="kotlin">Kotlin</SelectItem>
                            <SelectItem value="html">HTML</SelectItem>
                            <SelectItem value="css">CSS</SelectItem>
                            <SelectItem value="sql">SQL</SelectItem>
                            <SelectItem value="bash">Bash</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="yaml">YAML</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="filename">Filename (optional)</Label>
                        <Input
                          id="filename"
                          value={codeFilename}
                          onChange={(e) => setCodeFilename(e.target.value)}
                          placeholder="e.g. app.js"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="code">Code</Label>
                      <Textarea
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Paste your code here..."
                        className="h-40 font-mono"
                      />
                    </div>
                    <Button type="button" onClick={handleCodeSubmit}>
                      Send Code Snippet
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isSelfDestructDialogOpen} onOpenChange={setIsSelfDestructDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="ghost" size="icon">
                    <Clock className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Self-Destructing Message</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Self-destruct timer (seconds)</Label>
                      <Tabs defaultValue="30" onValueChange={(v) => setSelfDestructTime(Number.parseInt(v))}>
                        <TabsList className="grid grid-cols-4">
                          <TabsTrigger value="10">10s</TabsTrigger>
                          <TabsTrigger value="30">30s</TabsTrigger>
                          <TabsTrigger value="60">1m</TabsTrigger>
                          <TabsTrigger value="300">5m</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        {...form.register("message")}
                        placeholder="Type your message..."
                        className="min-h-20"
                      />
                    </div>
                    <Button type="button" onClick={handleSelfDestructMessage}>
                      Send Self-Destructing Message
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <AIAssistDialog
                isOpen={isAIDialogOpen}
                onClose={() => setIsAIDialogOpen(false)}
                onSendMessage={(content) => {
                  onSendMessage({
                    content,
                    type: "text",
                  })
                }}
              />

              <DialogTrigger asChild>
                <Button type="button" variant="ghost" size="icon" onClick={() => setIsAIDialogOpen(true)}>
                  <Bot className="h-5 w-5" />
                </Button>
              </DialogTrigger>

              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormControl>
                  <Textarea
                    placeholder="Type a message..."
                    className="min-h-10 resize-none"
                    {...field}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        form.handleSubmit(onSubmit)()
                      }
                    }}
                    onChange={(e) => {
                      field.onChange(e)
                      handleTyping()
                    }}
                  />
                </FormControl>
              )}
            />
          </div>
          <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-full">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </Form>
    </div>
  )
}
