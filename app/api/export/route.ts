import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { decryptMessage } from "@/lib/encryption"
import { format } from "date-fns"

export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const chatId = url.searchParams.get("chatId")
    const exportFormat = url.searchParams.get("format") || "json"

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 })
    }

    // Get messages for the chat
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, recipientId: chatId },
          { senderId: chatId, recipientId: session.user.id },
        ],
      },
      orderBy: {
        sentAt: "asc",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Decrypt messages
    const decryptedMessages = await Promise.all(
      messages.map(async (message) => {
        try {
          const decryptedContent = await decryptMessage(message.content)
          return {
            ...message,
            content: decryptedContent,
          }
        } catch (error) {
          console.error("Failed to decrypt message:", error)
          return {
            ...message,
            content: "Failed to decrypt message",
          }
        }
      }),
    )

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "Chat Exported",
        details: `Exported chat with user ${chatId} in ${exportFormat} format`,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      },
    })

    if (exportFormat === "markdown") {
      // Generate markdown export
      const markdown = generateMarkdownExport(decryptedMessages)

      return new NextResponse(markdown, {
        headers: {
          "Content-Type": "text/markdown",
          "Content-Disposition": `attachment; filename="chat-export-${new Date().toISOString().split("T")[0]}.md"`,
        },
      })
    } else {
      // Default to JSON export
      return NextResponse.json({ messages: decryptedMessages })
    }
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export chat" }, { status: 500 })
  }
}

function generateMarkdownExport(messages: any[]) {
  const now = new Date()
  let markdown = `# Chat Export\n\n`
  markdown += `Generated: ${format(now, "MMMM d, yyyy 'at' HH:mm")}\n\n`
  markdown += `---\n\n`

  messages.forEach((message) => {
    const timestamp = format(new Date(message.sentAt), "MMM d, yyyy HH:mm:ss")
    markdown += `### ${message.sender.name} (${timestamp})\n\n`

    if (message.type === "code") {
      markdown += "```\n"
      markdown += message.content
      markdown += "\n```\n\n"
    } else if (message.type === "image") {
      markdown += `![Image](${message.mediaUrl})\n\n`
    } else if (message.type === "file") {
      markdown += `[File: ${message.content}](${message.mediaUrl})\n\n`
    } else {
      markdown += `${message.content}\n\n`
    }

    markdown += `---\n\n`
  })

  return markdown
}
