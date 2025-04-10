"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Check, CheckCheck, Copy, Reply, Trash, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CodeBlock } from "./code-block"
import { EmojiPicker } from "./emoji-picker"
import { decryptMessage } from "@/lib/encryption"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ChatMessageProps {
  message: {
    id: string
    content: string
    senderId: string
    senderName: string
    senderImage?: string
    timestamp: Date
    status: "sent" | "delivered" | "read"
    type: "text" | "code" | "image" | "file" | "link" | "markdown"
    replyTo?: {
      id: string
      content: string
      senderName: string
    }
    codeLanguage?: string
    codeFilename?: string
    mediaUrl?: string
    linkPreview?: {
      title: string
      description: string
      image: string
      url: string
    }
    selfDestruct?: boolean
    selfDestructTime?: number
  }
  isCurrentUser: boolean
  onReply: (messageId: string) => void
  onDelete: (messageId: string) => void
  onReact: (messageId: string, emoji: string) => void
}

export function ChatMessage({ message, isCurrentUser, onReply, onDelete, onReact }: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false)
  const [copied, setCopied] = useState(false)
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null)

  // Decrypt message content if not already decrypted
  const getMessageContent = async () => {
    if (!decryptedContent) {
      try {
        const content = await decryptMessage(message.content)
        setDecryptedContent(content)
        return content
      } catch (error) {
        console.error("Failed to decrypt message:", error)
        return "Failed to decrypt message"
      }
    }
    return decryptedContent
  }

  const handleCopy = async () => {
    const content = await getMessageContent()
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderMessageContent = () => {
    const content = decryptedContent || message.content

    switch (message.type) {
      case "code":
        return (
          <CodeBlock code={content} language={message.codeLanguage || "javascript"} filename={message.codeFilename} />
        )
      case "image":
        return (
          <div className="mt-2 overflow-hidden rounded-lg">
            <img src={message.mediaUrl || "/placeholder.svg"} alt="Image" className="max-h-80 w-auto object-contain" />
          </div>
        )
      case "file":
        return (
          <div className="mt-2 flex items-center gap-2 rounded-lg border p-3">
            <div className="flex-1 truncate">
              <p className="text-sm font-medium">{content}</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={message.mediaUrl} download target="_blank" rel="noopener noreferrer">
                Download
              </a>
            </Button>
          </div>
        )
      case "link":
        return (
          <div className="mt-2 overflow-hidden rounded-lg border">
            {message.linkPreview?.image && (
              <img
                src={message.linkPreview.image || "/placeholder.svg"}
                alt={message.linkPreview.title}
                className="h-32 w-full object-cover"
              />
            )}
            <div className="p-3">
              <h4 className="font-medium">{message.linkPreview?.title}</h4>
              <p className="text-sm text-muted-foreground">{message.linkPreview?.description}</p>
              <a
                href={message.linkPreview?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-sm text-primary"
              >
                {message.linkPreview?.url}
              </a>
            </div>
          </div>
        )
      case "markdown":
        return (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )
      default:
        return <p className="whitespace-pre-wrap break-words">{content}</p>
    }
  }

  return (
    <div
      className={cn("group relative mb-4 flex gap-3", isCurrentUser ? "flex-row-reverse" : "flex-row")}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.senderImage} alt={message.senderName} />
        <AvatarFallback>
          {message.senderName
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "max-w-[70%] rounded-lg px-4 py-2",
          isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
        )}
      >
        {message.replyTo && (
          <div className="mb-2 rounded border-l-2 border-primary/50 pl-2 text-xs">
            <p className="font-medium">{message.replyTo.senderName}</p>
            <p className="truncate opacity-80">{message.replyTo.content}</p>
          </div>
        )}

        {message.selfDestruct && (
          <div className="mb-1 text-xs font-medium text-destructive">
            Self-destructs in {message.selfDestructTime} seconds
          </div>
        )}

        {renderMessageContent()}

        <div className="mt-1 flex items-center justify-end gap-1 text-xs opacity-70">
          <span>{format(message.timestamp, "HH:mm")}</span>
          {isCurrentUser && (
            <span>
              {message.status === "read" ? (
                <CheckCheck className="h-3 w-3" />
              ) : message.status === "delivered" ? (
                <Check className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3 opacity-50" />
              )}
            </span>
          )}
        </div>
      </div>

      {showActions && (
        <div className={cn("absolute top-0 flex items-center gap-1", isCurrentUser ? "left-0" : "right-0")}>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full bg-background shadow"
            onClick={() => onReply(message.id)}
          >
            <Reply className="h-3.5 w-3.5" />
          </Button>

          <EmojiPicker onEmojiSelect={(emoji) => onReact(message.id, emoji)} />

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full bg-background shadow"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-background shadow">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isCurrentUser ? "start" : "end"}>
              <DropdownMenuItem onClick={() => onDelete(message.id)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>Export Chat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
